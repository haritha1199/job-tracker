import { useEffect, useState } from "react";
import { apihelper } from "./api";
import type { Application } from "./types";
import NewApplication from "./NewApplication";

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await apihelper<Application[]>('GET', '/applications');
        setApplications(result);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <>
      <h2>My applications</h2>
      <NewApplication onCreated={(created) => setApplications(prev => [created, ...prev])} />
      {applications.length === 0 ? (<p>No applications yet </p>) :
        (
          <ul>
            {applications.map((app) => (
              <li key={app.id}>
                {app.company}, {app.role}, {app.status}{' '}
                {app.date_applied !== null
                  ? new Date(app.date_applied).toLocaleDateString()
                  : ''}
                <button onClick={() => handleDelete(app.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )
      }
    </>
  )
}