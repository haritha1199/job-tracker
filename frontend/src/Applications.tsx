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
      setFollowUpsId(await fetchFollowUps());
    }
    catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, id: string) {
    try {
      if (!e.target.files?.[0]) return;
      const file = e.target.files?.[0];
      e.target.value = '';

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
      }
      else if (response.status === 401) {
        alert("Token has expired");
      }
      else {
        alert("Download failed");
      }
      return;
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

  if (loading) return <p className="muted">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  return (
    <>
      <section className="card">
        <h2 className="section-title">Add application</h2>
        <NewApplication onSaved={async (created) => {
          setApplications(prev => [created, ...prev]);
          setFollowUpsId(await fetchFollowUps());
        }} />
      </section>

      <h2 className="section-title list-title">My applications</h2>

      {applications.length === 0 ? (
        <p className="empty card">No applications yet. Add your first one above.</p>
      ) : (
        <ul className="app-list">
          {applications.map((app) => (
            <li key={app.id} className="card">
              {app.id === editingId ? (
                <NewApplication
                  initial={app}
                  onSaved={async (saved) => {
                    setApplications(prev => prev.map(a => a.id === saved.id ? saved : a));
                    setEditingId(null);
                    setFollowUpsId(await fetchFollowUps());
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="app-top">
                    <div>
                      <div className="company">{app.company}</div>
                      <div className="muted">{app.role}</div>
                    </div>
                    <div className="badges">
                      <span className={`badge badge-${app.status}`}>{app.status}</span>
                      {followUpsId.has(app.id) && <span className="badge badge-followup">Follow up</span>}
                    </div>
                  </div>

                  <div className="app-meta">
                    {app.date_applied !== null && (
                      <span>Applied {new Date(app.date_applied).toLocaleDateString()}</span>
                    )}
                    {app.salary_range && <span>{app.salary_range}</span>}
                    {app.link && <a href={app.link} target="_blank" rel="noreferrer">View posting</a>}
                  </div>

                  <div className="app-actions">
                    <span className="resume-status">
                      {app.resume_path !== null ? 'Resume uploaded' : 'No resume'}
                    </span>
                    {app.resume_path !== null && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(app)}>Download</button>
                    )}
                    <label className="btn btn-secondary btn-sm">
                      {app.resume_path !== null ? 'Replace' : 'Upload resume'}
                      <input type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => handleUpload(e, app.id)} />
                    </label>
                    <div className="actions-right">
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(app.id)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(app.id)}>Delete</button>
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}