import { useState } from "react";
import type { FormEvent } from "react";
import type { Application } from "./types";
import { apihelper } from "./api";

export default function NewApplication({ initial, onSaved, onCancel }: {
  initial?: Application;
  onSaved: (app: Application) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    company: initial?.company ?? '',
    role: initial?.role ?? '',
    status: initial?.status ?? 'applied',
    dateApplied: initial?.date_applied
      ? new Date(initial.date_applied).toLocaleDateString('en-CA')
      : '',
    link: initial?.link ?? '',
    salaryRange: initial?.salary_range ?? '',
  });
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      if (initial) {
        const result = await apihelper<Application>('PUT', `/applications/${initial.id}`, {
          company: form.company,
          role: form.role,
          status: form.status,
          dateApplied: form.dateApplied || null,
          link: form.link || null,
          salaryRange: form.salaryRange || null,
        });
        onSaved(result);
      }
      else {
        const result = await apihelper<Application>('POST', '/applications', {
          company: form.company,
          role: form.role,
          status: form.status,
          dateApplied: form.dateApplied || null,
          link: form.link || null,
          salaryRange: form.salaryRange || null,
        });
        onSaved(result);
        setForm({
          company: '',
          role: '',
          status: 'applied',
          dateApplied: '',
          link: '',
          salaryRange: '',
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save application');
    }
  }

  return (
    <form className="app-form" onSubmit={handleSubmit}>
      <label className="field">
        Company
        <input required type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </label>

      <label className="field">
        Role
        <input required type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
      </label>

      <label className="field">
        Link
        <input type="text" value={form.link} placeholder="https://..." onChange={(e) => setForm({ ...form, link: e.target.value })} />
      </label>

      <label className="field">
        Salary range
        <input type="text" value={form.salaryRange} placeholder="e.g. 90k-110k" onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} />
      </label>

      <label className="field">
        Date applied
        <input type="date" value={form.dateApplied} onChange={(e) => setForm({ ...form, dateApplied: e.target.value })} />
      </label>

      <label className="field">
        Status
        <select name="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Application['status'] })}>
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="rejected">Rejected</option>
          <option value="offer">Offer</option>
        </select>
      </label>

      {error && <p className="error full">{error}</p>}

      <div className="form-actions full">
        {onCancel && (
          <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        )}
        <button className="btn btn-primary" type="submit">{initial ? 'Save' : 'Add application'}</button>
      </div>
    </form>
  );
}