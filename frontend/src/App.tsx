import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Chat } from './pages/Chat';

function App() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('username');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  const handleLogin = (name: string) => {
    sessionStorage.setItem('username', name);
    setUsername(name);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('username');
    setUsername(null);
  };

  return (
    <>
      {!username ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Chat username={username} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
