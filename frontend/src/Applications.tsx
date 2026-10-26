import { useEffect, useState } from "react";
import { apihelper } from "./api";
import type { Application } from "./types";
import NewApplication from "./NewApplication";
import { backendURL } from "./api";

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [followUpsId, setFollowUpsId] = useState<Set<string>>(new Set());

  async function fetchFollowUps() {
    const result = await apihelper<Application[]>('GET', '/applications/follow-ups');
    return new Set(result.map(a => a.id));
  }

  useEffect(() => {
    async function load() {
      try {
        const result = await apihelper<Application[]>('GET', '/applications');
        setApplications(result);
        setFollowUpsId(await fetchFollowUps());
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
      finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this application'))
      return;
    try {
      await apihelper<string>('DELETE', `/applications/${id}`);
      setApplications(prev => prev.filter(a => a.id !== id));
    }
    catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, id: string) {
    try {
      if (!e.target.files?.[0]) return;
      const file = e.target.files?.[0];

      const fd = new FormData();
      fd.append('resume', file);

      const saved = await apihelper<Application>('POST', `/applications/${id}/resume`, fd);
      setApplications(prev => prev.map(a => a.id === saved.id ? saved : a));
    }
    catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function handleDownload(app: Application) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${backendURL}/applications/${app.id}/resume`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        alert("Resume unavailable");
        return;
      }
      else if (response.status === 401) {
        alert("Token has expired");
        return;
      }
    }

    const filename = app.resume_path?.split(/[\\/]/).pop();

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? 'resume';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <>
      <h2>My applications</h2>
      <NewApplication onSaved={async (created) => {
        setApplications(prev => [created, ...prev]);
        setFollowUpsId(await fetchFollowUps());
      }} />
      {applications.length === 0 ? (<p>No applications yet </p>) :
        (
          <ul>
            {applications.map((app) => (
              <li key={app.id}>
                {app.id === editingId ? (
                  <>
                    <NewApplication
                      initial={app}
                      onSaved={async (saved) => {
                        setApplications(prev => prev.map(a => a.id === saved.id ? saved : a));
                        setEditingId(null);
                        setFollowUpsId(await fetchFollowUps());
                      }}
                    />
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    {app.company}, {app.role}, {app.status}{' '}
                    {app.date_applied !== null
                      ? new Date(app.date_applied).toLocaleDateString()
                      : ''}
                    {followUpsId.has(app.id) ? ' Follow up' : ''}
                    <input type="file" accept=".pdf, .doc, .docx" onChange={(e) => handleUpload(e, app.id)} />
                    {app.resume_path !== null
                      ? <> Resume uploaded <button onClick={() => handleDownload(app)}>Download</button></>
                      : ' No resume'}
                    <button onClick={() => setEditingId(app.id)}>Edit</button>
                    <button onClick={async () => {
                      handleDelete(app.id);
                      setFollowUpsId(await fetchFollowUps());
                    }}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )
      }
    </>
  )
}