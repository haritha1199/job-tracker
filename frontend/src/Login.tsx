import { useState } from "react";
import { apihelper } from "./api";

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'signup') {
        await apihelper('POST', '/auth/signup', { email, password });
      }
      const result = await apihelper<{ token: string }>('POST', '/auth/login', { email, password });

      const token = result.token;
      localStorage.setItem('token', token);
      onLogin(token);
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="auth-wrap">
      <h1>Job Tracker</h1>
      <div className="card">
        <h2 className="section-title">{mode === 'login' ? 'Log in' : 'Create account'}</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            Email
            <input required type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="field">
            Password
            <input required type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn btn-primary" type="submit">
            {mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <div className="auth-switch">
          <button
            className="btn-link"
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  )
}