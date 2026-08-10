import React from 'react';
import { LogOut, Phone, Video } from 'lucide-react';
import type { CallType } from '../types/call';

interface ChatHeaderProps {
  username: string;
  isConnected: boolean;
  onLogout: () => void;
  onlineUsers: string[];
  callState: string;
  onStartCall: (targetUser: string, type: CallType) => void;
  onJoinGroupCall: (type: CallType) => void;
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
}) => {
  const others = onlineUsers.filter((u) => u !== username);
  const isInCall = callState !== 'idle';

  return (
    <div
      /* grid-based header: never clips, never collapses */
      style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '12px', padding: '10px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.06)', position: 'relative', zIndex: 40, flexShrink: 0 }}
    >

      {/* ── Col 1: Logo + name ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <VedazLogo />
        <div className="hidden sm:block" style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '16px', color: '#111827', lineHeight: 1.2 }}>Vedaz Chat</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', lineHeight: 1.2 }}>Let's Talk</p>
        </div>
      </div>

      {/* ── Col 2: Call buttons (WhatsApp style) ───────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingRight: '16px' }}>
        <button
          onClick={() => {
            if (others.length === 1) onStartCall(others[0], 'audio');
            else onJoinGroupCall('audio');
          }}
          disabled={isInCall}
          title="Voice Call"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'transparent', border: 'none',
            color: isInCall ? '#d1d5db' : '#4f46e5',
            cursor: isInCall ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!isInCall) (e.currentTarget as HTMLElement).style.background = '#f3f4f6'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
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
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'transparent', border: 'none',
            color: isInCall ? '#d1d5db' : '#4f46e5',
            cursor: isInCall ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!isInCall) (e.currentTarget as HTMLElement).style.background = '#f3f4f6'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Video size={22} />
        </button>
      </div>

      {/* ── Col 3: Profile + Leave ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Avatar pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '5px 10px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block" style={{ lineHeight: 1.3 }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#111827', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</p>
            <p style={{ margin: 0, fontSize: '10px', color: isConnected ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? '#10b981' : '#ef4444', display: 'inline-block', animation: isConnected ? 'pulse 2s infinite' : 'none' }} />
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Leave */}
        <button
          onClick={onLogout}
          title="Leave chat"
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: '13px', transition: 'all .15s' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#fef2f2'; el.style.color = '#dc2626'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#6b7280'; }}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

    </div>
  );
};
