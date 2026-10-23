import { useState } from 'react'
import Applications from './Applications';
import './App.css'
import Login from './Login';

function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  return (
    <>
      {token ? <> <Applications />
      <button onClick={() =>
        {
          localStorage.removeItem('token');
          setToken(null)
        }
      }>Log Out</button>
      </> : <Login onLogin={setToken} />}
    </>
  )
}

export default App
