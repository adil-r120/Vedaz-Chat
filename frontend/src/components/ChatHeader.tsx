import React from 'react';
import { LogOut, Phone, Video, Sun, Moon, Users } from 'lucide-react';
import type { CallType } from '../types/call';
import { useTheme } from '../contexts/ThemeContext';

interface ChatHeaderProps {
  username: string;
  isConnected: boolean;
  onLogout: () => void;
  onlineUsers: string[];
  callState: string;
  onStartCall: (targetUser: string, type: CallType) => void;
  onJoinGroupCall: (type: CallType) => void;
  onToggleUsers?: () => void;
}

/* ── Inline SVG logo ──────────────────────────────────────────────────────── */
const VedazLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="38" height="38" aria-hidden="true">
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

/* ── Component ────────────────────────────────────────────────────────────── */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  username,
  isConnected,
  onLogout,
  onlineUsers,
  callState,
  onStartCall,
  onJoinGroupCall,
  onToggleUsers,
}) => {
  const others = onlineUsers.filter((u) => u !== username);
  const isInCall = callState !== 'idle';
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-2.5 bg-white dark:bg-wa-panel border-b border-gray-200 dark:border-wa-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative z-40 shrink-0 transition-colors">
      
      {/* ── Col 1: Logo + name ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 min-w-0">
        <VedazLogo />
        <div className="hidden sm:block min-w-0">
          <p className="m-0 font-extrabold text-[16px] text-gray-900 dark:text-wa-text leading-[1.2]">Vedaz Chat</p>
          <p className="m-0 text-[11px] text-gray-400 dark:text-wa-text-muted leading-[1.2]">Let's Talk</p>
        </div>
      </div>

      {/* ── Col 2: Call buttons (WhatsApp style) ───────────────────────────── */}
      <div className="flex justify-end items-center gap-3 pr-4">
        <button
          onClick={() => {
            if (others.length === 1) onStartCall(others[0], 'audio');
            else onJoinGroupCall('audio');
          }}
          disabled={isInCall}
          title="Voice Call"
          className={`flex items-center justify-center w-[38px] h-[38px] rounded-full transition-colors ${isInCall ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-indigo-600 dark:text-[#00a884] hover:bg-gray-100 dark:hover:bg-wa-input cursor-pointer'}`}
        >
          <Phone size={20} />
        </button>

        <button
          onClick={() => {
            if (others.length === 1) onStartCall(others[0], 'video');
            else onJoinGroupCall('video');
          }}
          disabled={isInCall}
          title="Video Call"
          className={`flex items-center justify-center w-[38px] h-[38px] rounded-full transition-colors ${isInCall ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-indigo-600 dark:text-[#00a884] hover:bg-gray-100 dark:hover:bg-wa-input cursor-pointer'}`}
        >
          <Video size={22} />
        </button>
      </div>

      {/* ── Col 3: Profile + Leave + Theme ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 dark:text-wa-text-muted dark:hover:bg-wa-input transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Mobile Users Toggle */}
        <button
          onClick={onToggleUsers}
          title="Online Users"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 dark:text-wa-text-muted dark:hover:bg-wa-input transition-colors"
        >
          <Users size={18} />
        </button>

        {/* Avatar pill */}
        <div className="flex items-center gap-[7px] bg-gray-50 dark:bg-wa-input border border-gray-200 dark:border-wa-border rounded-[10px] py-[5px] px-[10px] transition-colors">
          <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-[12px] shrink-0">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block leading-[1.3]">
            <p className="m-0 text-[12px] font-bold text-gray-900 dark:text-wa-text max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">{username}</p>
            <p className="m-0 text-[10px] flex items-center gap-[3px]" style={{ color: isConnected ? '#10b981' : '#ef4444' }}>
              <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: isConnected ? '#10b981' : '#ef4444', animation: isConnected ? 'pulse 2s infinite' : 'none' }} />
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Leave */}
        <button
          onClick={onLogout}
          title="Leave chat"
          className="flex items-center gap-[5px] py-[7px] px-[12px] rounded-[10px] font-semibold text-[13px] transition-all text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-wa-text-muted dark:hover:bg-red-900/30 dark:hover:text-red-400"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

    </div>
  );
};
