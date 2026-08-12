import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

import { VedazLogo } from '../components/VedazLogo';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    
    // Tilt angle max 10 degrees
    setTilt({ x: -y * 10, y: x * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    onLogin(username.trim());
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-slate-50 dark:bg-wa-bg transition-colors"
      style={{ perspective: '1200px' }}
    >

      {/* Dynamic Fluid Gradient Mesh Background */}
      <div className="absolute inset-0 overflow-hidden w-full h-full pointer-events-none">
        <div className="absolute top-[0%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-indigo-500/40 dark:bg-[#00a884]/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] animate-blob"></div>
        <div className="absolute top-[0%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-purple-400/40 dark:bg-indigo-600/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-blue-400/40 dark:bg-emerald-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-pink-400/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] animate-blob" style={{ animationDelay: '6s' }}></div>
      </div>
      
      <div 
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out'
        }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="w-full bg-white/60 dark:bg-wa-panel/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-wa-border/50 overflow-hidden animate-fade-in-up transition-colors">
          <div className="p-10 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-indigo-600/10 pointer-events-none"></div>
            
            <div className="mx-auto flex justify-center mb-6">
              <VedazLogo />
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-wa-text tracking-tight mb-2">Vedaz Chat</h1>
            <p className="text-gray-500 dark:text-wa-text-muted flex items-center justify-center gap-2">
              Let's Discuss as a Team
            </p>
          </div>
          
          <div className="p-10 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-wa-text mb-2 ml-1">
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
                    className={`w-full pl-5 pr-4 py-4 rounded-xl border-2 ${
                      error ? 'border-red-400 focus:ring-red-500' : 'border-white/50 dark:border-wa-border focus:border-blue-500/50 dark:focus:border-[#00a884]'
                    } bg-white/80 dark:bg-wa-input/80 focus:bg-white dark:focus:bg-wa-input focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-[#00a884]/20 transition-all text-gray-900 dark:text-wa-text placeholder-gray-400 dark:placeholder-wa-text-muted shadow-sm`}
                    placeholder="e.g. Adil / 123..."
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-500 ml-1 font-medium">{error}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#00a884] dark:to-[#008f6f] text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-[#008f6f] dark:hover:to-[#00705a] hover:shadow-xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
              >
                Enter Chat <ArrowRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
