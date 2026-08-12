import { useState, useEffect, lazy, Suspense } from 'react';

const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Chat = lazy(() => import('./pages/Chat').then(module => ({ default: module.Chat })));

const LoadingScreen = () => (
  <div className="bg-slate-50 dark:bg-wa-bg transition-colors" style={{ width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #c7d2fe', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Loading…</p>
    </div>
  </div>
);

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
    <Suspense fallback={<LoadingScreen />}>
      {!username ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Chat username={username} onLogout={handleLogout} />
      )}
    </Suspense>
  );
}

export default App;
