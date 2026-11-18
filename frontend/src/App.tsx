import { useState } from 'react'
import Applications from './Applications';
import './App.css'
import Login from './Login';

function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  if (!token) return <Login onLogin={setToken} />;

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">Job Tracker</h1>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            localStorage.removeItem('token');
            setToken(null);
          }}
        >
          Log out
        </button>
      </header>
      <Applications />
    </>
  )
}

export default App