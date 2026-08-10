import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { OnlineUsers } from '../components/OnlineUsers';
import { TypingIndicator } from '../components/TypingIndicator';
import { IncomingCallModal } from '../components/IncomingCallModal';
import { CallScreen } from '../components/CallScreen';
import { useSocket } from '../hooks/useSocket';
import { useCall } from '../hooks/useCall';
import type { IMessage } from '../types/message';
import { getMessages } from '../services/api';
import { MessagesSquare } from 'lucide-react';

interface ChatProps {
  username: string;
  onLogout: () => void;
}

export const Chat: React.FC<ChatProps> = ({ username, onLogout }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ── Load history ─────────────────────────────────────────────────────── */
  useEffect(() => {
    getMessages()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  /* ── Socket handlers ──────────────────────────────────────────────────── */
  const handleMessageReceived = useCallback((msg: IMessage) => {
    setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
  }, []);

  const handleTypingUpdate = useCallback(
    ({ username: u, isTyping }: { username: string; isTyping: boolean }) => {
      if (u === username) return;
      setTypingUsers(prev => {
        const s = new Set(prev);
        isTyping ? s.add(u) : s.delete(u);
        return s;
      });
    },
    [username]
  );

  const handleReadUpdate = useCallback((id: string) => {
    setMessages(prev => prev.map(m => m._id === id ? { ...m, status: 'read' } : m));
  }, []);

  const handleMessageEdited = useCallback((data: { messageId: string; newMessage: string }) => {
    setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, message: data.newMessage } : m));
  }, []);

  const handleMessageDeleted = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  }, []);

  const { isConnected, sendSocketMessage, sendTypingStart, sendTypingStop, sendReadStatus, sendEditMessage, sendDeleteMessage } =
    useSocket({
      username,
      onMessageReceived: handleMessageReceived,
      onUserStatusChange: setOnlineUsers,
      onTypingUpdate: handleTypingUpdate,
      onMessageReadUpdate: handleReadUpdate,
      onMessageEdited: handleMessageEdited,
      onMessageDeleted: handleMessageDeleted,
    });

  /* ── Calling ──────────────────────────────────────────────────────────── */
  const callHook = useCall({ username });

  const showIncoming = callHook.callState === 'incoming' && callHook.callType && callHook.remoteUser;

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#eff6ff,#eef2ff,#ecfeff)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #c7d2fe', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Loading…</p>
        </div>
      </div>
    );
  }

  /* ── Main layout ──────────────────────────────────────────────────────── */
  /*
   * CSS Grid on the root:
   *   rows: auto (header) + 1fr (body)
   *   cols: 1fr (messages) + auto (sidebar)
   *
   *   Header spans both columns.
   *   Body = message column + online users sidebar.
   *
   * This is the most reliable way to ensure:
   *   - Header is always fully visible
   *   - Body fills exactly the remaining height
   *   - No overflow/clipping surprises
   */
  return (
    <>
      <div
        style={{
          width: '100vw',
          height: '100dvh',
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          gridTemplateColumns: '1fr auto',
          overflow: 'hidden',
          background: '#f8fafc',
        }}
      >
        {/* ── Row 1, spans all columns: Header ───────────────────────────── */}
        <div style={{ gridColumn: '1 / -1', gridRow: '1' }}>
          <ChatHeader
            username={username}
            isConnected={isConnected}
            onLogout={onLogout}
            onlineUsers={onlineUsers}
            callState={callHook.callState}
            onStartCall={callHook.startCall}
            onJoinGroupCall={callHook.joinGroupCall}
          />
        </div>

        {/* ── Row 2, Col 1: Messages + Input ─────────────────────────────── */}
        <div
          style={{
            gridColumn: '1',
            gridRow: '2',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
            background: 'linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)',
          }}
        >
          {/* Scrollable messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {messages.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#9ca3af' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessagesSquare size={28} color="#a5b4fc" />
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isOwnMessage={msg.username === username}
                    isSequential={!!(i > 0 && messages[i - 1].username === msg.username)}
                    onRead={sendReadStatus}
                    onEdit={sendEditMessage}
                    onDelete={sendDeleteMessage}
                  />
                ))}
              </div>
            )}
            <TypingIndicator typingUsers={Array.from(typingUsers)} />
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <MessageInput
            onSendMessage={sendSocketMessage}
            onTypingStart={sendTypingStart}
            onTypingStop={sendTypingStop}
          />
        </div>

        {/* ── Row 2, Col 2: Online users sidebar ─────────────────────────── */}
        <div style={{ gridColumn: '2', gridRow: '2', minHeight: 0, overflowY: 'auto', borderLeft: '1px solid #e5e7eb' }}>
          <OnlineUsers
            users={onlineUsers}
            currentUser={username}
          />
        </div>
      </div>

      {/* ── Overlays ───────────────────────────────────────────────────────── */}
      {showIncoming && (
        <IncomingCallModal
          callerName={callHook.remoteUser!}
          callType={callHook.callType!}
          onAccept={callHook.acceptCall}
          onReject={callHook.rejectCall}
        />
      )}
      {callHook.callState !== 'idle' && callHook.callState !== 'incoming' && (
        <CallScreen
          callState={callHook.callState}
          callMode={callHook.callMode}
          callType={callHook.callType!}
          remoteUser={callHook.remoteUser}
          localStream={callHook.localStream}
          participants={callHook.participants}
          isMuted={callHook.isMuted}
          isCameraOff={callHook.isCameraOff}
          callDuration={callHook.callDuration}
          onEnd={callHook.callMode === 'group' ? callHook.leaveGroupCall : callHook.endCall}
          onCancel={callHook.cancelCall}
          onToggleMute={callHook.toggleMute}
          onToggleCamera={callHook.toggleCamera}
        />
      )}
    </>
  );
};
