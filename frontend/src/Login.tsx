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
      if(mode === 'signup') {
        await apihelper('POST', '/auth/signup', { email, password });
      }
      const result = await apihelper<{ token: string }>('POST', '/auth/login', { email, password });

      const token = result.token;
      localStorage.setItem('token', token);
      onLogin(token);
    }
    catch(err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }
  return (
    <div>
      {mode==='login'? 'Log In' : 'Create account'}
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
      </label>

      <label>
        Password:
        <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
      </label>
      <button type="submit">{mode === 'login' ? 'Login' : 'Sign up'}</button>
    </form>

    <button type="button" onClick={() => {setMode(mode === 'login' ? 'signup' : 'login');
    setError('')}}>{mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}</button>

     {error && <p>{error}</p>}
    </div>
  )
}


