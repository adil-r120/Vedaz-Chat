import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const [showMobileUsers, setShowMobileUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ── Group messages by date ───────────────────────────────────────────── */
  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string; messages: IMessage[] }[] = [];
    
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateLabel = date.toLocaleDateString();
      if (date.toDateString() === today.toDateString()) {
        dateLabel = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = "Yesterday";
      }
      
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateLabel === dateLabel) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ dateLabel, messages: [msg] });
      }
    });
    
    return groups;
  }, [messages]);

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
      <div className="w-screen h-[100dvh] grid grid-rows-[auto_1fr] grid-cols-[1fr_auto] overflow-hidden bg-slate-50 dark:bg-wa-bg transition-colors">
        {/* Skeleton Header */}
        <div style={{ gridColumn: '1 / -1', gridRow: '1' }} className="h-[68px] bg-white dark:bg-wa-panel border-b border-slate-200 dark:border-wa-border flex items-center px-4 md:px-6 justify-between animate-pulse">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex flex-col gap-2">
                 <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                 <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
           </div>
           <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 lg:hidden" />
           </div>
        </div>

        {/* Skeleton Messages Area */}
        <div className="relative col-start-1 row-start-2 flex flex-col min-h-0 min-w-0 bg-gradient-to-b from-slate-50 to-white dark:from-wa-bg dark:to-wa-bg">
          <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col gap-6 animate-pulse">
             {/* Left bubble */}
             <div className="flex items-end gap-2 w-3/4 max-w-[320px]">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-bl-sm" />
             </div>
             {/* Right bubble */}
             <div className="flex items-end justify-end gap-2 w-3/4 max-w-[320px] self-end">
                <div className="h-20 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-br-sm" />
             </div>
             {/* Left bubble */}
             <div className="flex items-end gap-2 w-1/2 max-w-[240px]">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-bl-sm" />
             </div>
          </div>
          {/* Skeleton Input */}
          <div className="p-3 md:p-4 bg-white/80 dark:bg-wa-panel/80 backdrop-blur-md border-t border-slate-100 dark:border-wa-border flex items-center gap-2 md:gap-4 animate-pulse">
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
             <div className="h-[44px] flex-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
             <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
          </div>
        </div>

        {/* Skeleton Sidebar (lg only) */}
        <div className="hidden lg:block w-72 p-4 border-l border-slate-200 dark:border-wa-border bg-white dark:bg-wa-panel" style={{ gridColumn: '2', gridRow: '2' }}>
           <div className="animate-pulse flex flex-col gap-4 mt-2">
              <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                 </div>
              ))}
           </div>
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
      <div className="w-screen h-[100dvh] grid grid-rows-[auto_1fr] grid-cols-[1fr_auto] overflow-hidden bg-slate-50 dark:bg-wa-bg transition-colors">
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
            onToggleUsers={() => setShowMobileUsers(prev => !prev)}
          />
        </div>

        {/* ── Row 2, Col 1: Messages + Input ─────────────────────────────── */}
        <div className="relative col-start-1 row-start-2 flex flex-col min-h-0 min-w-0 bg-gradient-to-b from-slate-50 to-white dark:from-wa-bg dark:to-wa-bg transition-colors">
          {/* Scrollable messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', position: 'relative', zIndex: 1 }}>
            {messages.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#9ca3af' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessagesSquare size={28} color="#a5b4fc" />
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {groupedMessages.map((group) => (
                  <React.Fragment key={group.dateLabel}>
                    <div className="flex justify-center my-4 sticky top-2 z-10">
                      <span className="bg-white/90 dark:bg-wa-panel/90 text-gray-500 dark:text-wa-text-muted text-[11px] font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-md border border-gray-100 dark:border-wa-border uppercase tracking-wider">
                        {group.dateLabel}
                      </span>
                    </div>
                    {group.messages.map((msg, i) => (
                      <MessageBubble
                        key={msg._id}
                        message={msg}
                        isOwnMessage={msg.username === username}
                        isSequential={!!(i > 0 && group.messages[i - 1].username === msg.username)}
                        onRead={sendReadStatus}
                        onEdit={sendEditMessage}
                        onDelete={sendDeleteMessage}
                      />
                    ))}
                  </React.Fragment>
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
        <div className="hidden lg:block dark:border-wa-border" style={{ gridColumn: '2', gridRow: '2', minHeight: 0, overflowY: 'auto', borderLeft: '1px solid #e5e7eb' }}>
          <OnlineUsers
            users={onlineUsers}
            currentUser={username}
          />
        </div>
      </div>

      {/* ── Mobile Users Drawer ────────────────────────────────────────────── */}
      {showMobileUsers && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowMobileUsers(false)} />
          <div className="relative w-64 h-full bg-white dark:bg-wa-panel shadow-2xl overflow-y-auto transform transition-transform animate-fade-in-up" style={{ animation: 'slideInRight 0.2s ease-out forwards' }}>
            <OnlineUsers users={onlineUsers} currentUser={username} />
          </div>
        </div>
      )}

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
