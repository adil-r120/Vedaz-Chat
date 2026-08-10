import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

/* ── Inline SVG logo ──────────────────────────────────────────────────────── */
const VedazLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="80" height="80" aria-hidden="true" className="drop-shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
    <defs>
      <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <radialGradient id="rg1" cx="35%" cy="25%" r="60%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <filter id="ds1"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3730a3" floodOpacity="0.35" /></filter>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#lg1)" />
    <rect width="64" height="64" rx="15" fill="url(#rg1)" />
    <path d="M10 13C10 9.7 12.7 7 16 7h26c3.3 0 6 2.7 6 6v18c0 3.3-2.7 6-6 6H26L18 46V37c-3.3 0-6-2.7-6-6V13z" fill="#fff" opacity=".96" filter="url(#ds1)" />
    <path d="M33 41c0-1.7 1.3-3 3-3h14c1.7 0 3 1.3 3 3v9c0 1.7-1.3 3-3 3H40l-4 4v-4c-1.7 0-3-1.3-3-3v-9z" fill="#fff" opacity=".3" />
    <circle cx="22" cy="22" r="3" fill="url(#lg1)" />
    <circle cx="30" cy="22" r="3" fill="url(#lg1)" />
    <circle cx="38" cy="22" r="3" fill="url(#lg1)" />
    <rect x="8" y="8" width="48" height="7" rx="7" fill="#fff" opacity=".07" />
  </svg>
);

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    onLogin(username.trim());
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden animate-fade-in-up">
        <div className="p-10 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-indigo-600/10 pointer-events-none"></div>
          
          <div className="mx-auto flex justify-center mb-6">
            <VedazLogo />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Vedaz Chat</h1>
          <p className="text-gray-500 flex items-center justify-center gap-2">
            Let's Discuss as a Team
          </p>
        </div>
        
        <div className="p-10 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Create your Chatroom Name
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  className={`w-full pl-5 pr-4 py-4 rounded-2xl border-2 ${
                    error ? 'border-red-400 focus:ring-red-500' : 'border-white/50 focus:border-blue-500/50'
                  } bg-white/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 placeholder-gray-400 shadow-sm`}
                  placeholder="e.g. Xyz... / 123..."
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-500 ml-1 font-medium">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              Enter Chat <ArrowRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
