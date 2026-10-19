import { useState } from 'react'

import './App.css'
import Login from './Login';

function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  return (
    <>
      {token ? <> <p> My applications </p>
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
