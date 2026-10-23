import { useState } from "react";
import type { FormEvent } from "react";
import type { Application } from "./types";
import { apihelper } from "./api";

export default function NewApplication({ onCreated }: { onCreated: (app: Application) => void }) {
  const [form, setForm] = useState({
    company: '',
    role: '',
    status: 'applied',
    dateApplied: '',
    link: '',
    salaryRange: '',
  });
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      const result = await apihelper<Application>('POST', '/applications', {
        company: form.company,
        role: form.role,
        status: form.status,
        dateApplied: form.dateApplied || null,
        link: form.link || null,
        salaryRange: form.salaryRange || null,
      });
      onCreated(result);
      setForm({
        company: '',
        role: '',
        status: 'applied',
        dateApplied: '',
        link: '',
        salaryRange: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input required type="text" value={form.company} placeholder="company" onChange={(e) => setForm({ ...form, company: e.target.value })} />
      <input required type="text" value={form.role} placeholder="role" onChange={(e) => setForm({ ...form, role: e.target.value })} />
      <input type="text" value={form.link} placeholder="link" onChange={(e) => setForm({ ...form, link: e.target.value })} />
      <input type="text" value={form.salaryRange} placeholder="Salary Range" onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} />
      <input type="date" value={form.dateApplied} onChange={(e) => setForm({ ...form, dateApplied: e.target.value })} />
      <select name="status" id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
        <option value="applied">Applied</option>
        <option value="interviewing">Interviewing</option>
        <option value="rejected">Rejected</option>
        <option value="offer">Offer</option>
      </select>
      <button type="submit">Add</button>
      {error && <p>{error}</p>}
    </form>
  );
}