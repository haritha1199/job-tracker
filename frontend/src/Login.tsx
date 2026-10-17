import { useState } from "react";
import { apihelper } from "./api";

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    try {
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
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
      </label>

      <label>
        Password:
        <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
      </label>
      <button type="submit">Login</button>
    </form>

     {error && <p>{error}</p>}
    </div>
  )
}


