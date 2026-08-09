import { Server, Socket } from 'socket.io';
import { Message } from '../models/Message';

const onlineUsers = new Map<string, string>(); // socketId -> username
const activeCalls = new Map<string, string>(); // 1-on-1 calls: username -> partnerUsername
const groupCallUsers = new Set<string>(); // Group call: usernames

function getSocketId(username: string): string | undefined {
  for (const [sid, uname] of onlineUsers.entries()) {
    if (uname === username) return sid;
  }
  return undefined;
}

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // ── Chat: User joins ─────────────────────────────────────────────────────
    socket.on('user:join', (username: string) => {
      onlineUsers.set(socket.id, username);
      socket.broadcast.emit('user:joined', username);
      io.emit('user:online', Array.from(onlineUsers.values()));
      socket.emit('call:group-participants', Array.from(groupCallUsers));
    });

    // ── Chat: Send message ───────────────────────────────────────────────────
    socket.on('message:send', async (data: { username: string; message: string; type?: 'text' | 'call' }) => {
      try {
        const newMessage = await Message.create({
          username: data.username.trim(),
          message: data.message.trim(),
          status: 'sent',
          type: data.type || 'text',
        });
        io.emit('message:new', newMessage);
      } catch (error) {
        socket.emit('socket:error', 'Failed to send message');
      }
    });

    // Helper to send system call messages
    const sendSystemCallMessage = async (messageText: string) => {
      try {
        const newMessage = await Message.create({
          username: 'System',
          message: messageText,
          status: 'sent',
          type: 'call',
        });
        io.emit('message:new', newMessage);
      } catch (error) {
        console.error('Failed to save call system message', error);
      }
    };

    // ── Chat: Typing indicators ──────────────────────────────────────────────
    socket.on('typing:start', (username: string) => {
      socket.broadcast.emit('typing:update', { username, isTyping: true });
    });

    socket.on('typing:stop', (username: string) => {
      socket.broadcast.emit('typing:update', { username, isTyping: false });
    });

    // ── Chat: Message read ───────────────────────────────────────────────────
    socket.on('message:read', async (messageId: string) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: 'read' });
        io.emit('message:read', messageId);
      } catch (error) {
        console.error('Error updating message status');
      }
    });

    // ═════════════════════════════════════════════════════════════════════════
    // ── 1-ON-1 CALLING ───────────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════

    socket.on('call:initiate', (data: { to: string; from: string; callType: 'audio' | 'video' }) => {
      const { to, from, callType } = data;
      const targetSocketId = getSocketId(to);
      if (!targetSocketId) {
        socket.emit('call:error', { message: 'User is offline.' });
        return;
      }
      if (activeCalls.has(to) || activeCalls.has(from) || groupCallUsers.has(to) || groupCallUsers.has(from)) {
        socket.emit('call:busy', { message: 'User is currently on another call.' });
        return;
      }
      io.to(targetSocketId).emit('call:incoming', { from, callType });
    });

    socket.on('call:accept', (data: { to: string; from: string }) => {
      const { to, from } = data;
      const callerSocketId = getSocketId(to);
      activeCalls.set(from, to);
      activeCalls.set(to, from);
      if (callerSocketId) io.to(callerSocketId).emit('call:accepted', { from });
    });

    socket.on('call:reject', (data: { to: string; from: string }) => {
      const callerSocketId = getSocketId(data.to);
      if (callerSocketId) io.to(callerSocketId).emit('call:rejected', { from: data.from });
      sendSystemCallMessage(`${data.from} missed a call from ${data.to}`);
    });

    socket.on('call:cancel', (data: { to: string; from: string }) => {
      const calleeSocketId = getSocketId(data.to);
      if (calleeSocketId) io.to(calleeSocketId).emit('call:cancelled', { from: data.from });
      sendSystemCallMessage(`${data.to} missed a call from ${data.from}`);
    });

    socket.on('call:end', (data: { to: string; from: string }) => {
      const { to, from } = data;
      activeCalls.delete(from);
      activeCalls.delete(to);
      const targetSocketId = getSocketId(to);
      if (targetSocketId) io.to(targetSocketId).emit('call:ended', { from });
      sendSystemCallMessage(`${from} ended the call with ${to}`);
    });

    // ═════════════════════════════════════════════════════════════════════════
    // ── GROUP CALLING (MESH) ─────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════

    socket.on('call:join-group', (data: { username: string; callType: 'audio' | 'video' }, callback?: (participants: string[]) => void) => {
      const { username } = data;
      groupCallUsers.add(username);
      
      for (const u of groupCallUsers) {
        if (u !== username) {
          const sid = getSocketId(u);
          if (sid) io.to(sid).emit('call:user-joined-group', { username });
        }
      }

      io.emit('call:group-participants', Array.from(groupCallUsers));
      if (callback) callback(Array.from(groupCallUsers));
      
      // If they are the first one, they started it.
      if (groupCallUsers.size === 1) {
        sendSystemCallMessage(`${username} started a group call`);
      } else {
        sendSystemCallMessage(`${username} joined the group call`);
      }
    });

    socket.on('call:leave-group', (data: { username: string }) => {
      const { username } = data;
      if (groupCallUsers.has(username)) {
        groupCallUsers.delete(username);
        for (const u of groupCallUsers) {
          const sid = getSocketId(u);
          if (sid) io.to(sid).emit('call:user-left-group', { username });
        }
        io.emit('call:group-participants', Array.from(groupCallUsers));
        sendSystemCallMessage(`${username} left the group call`);
        if (groupCallUsers.size === 0) {
          sendSystemCallMessage(`Group call ended`);
        }
      }
    });

    // ═════════════════════════════════════════════════════════════════════════
    // ── WEBRTC SIGNALING (SHARED) ────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════

    socket.on('call:offer', (data: { to: string; from: string; offer: RTCSessionDescriptionInit }) => {
      const targetSocketId = getSocketId(data.to);
      if (targetSocketId) io.to(targetSocketId).emit('call:offer', { from: data.from, offer: data.offer });
    });

    socket.on('call:answer', (data: { to: string; from: string; answer: RTCSessionDescriptionInit }) => {
      const targetSocketId = getSocketId(data.to);
      if (targetSocketId) io.to(targetSocketId).emit('call:answer', { from: data.from, answer: data.answer });
    });

    socket.on('call:ice-candidate', (data: { to: string; from: string; candidate: RTCIceCandidateInit }) => {
      const targetSocketId = getSocketId(data.to);
      if (targetSocketId) io.to(targetSocketId).emit('call:ice-candidate', { from: data.from, candidate: data.candidate });
    });

    // ── Cleanup on disconnect ────────────────────────────────────────────────
    socket.on('user:leave', () => { handleDisconnect(socket.id); });
    socket.on('disconnect', () => { handleDisconnect(socket.id); });

    function handleDisconnect(socketId: string) {
      const username = onlineUsers.get(socketId);
      if (username) {
        // Cleanup 1-on-1
        const partner = activeCalls.get(username);
        if (partner) {
          activeCalls.delete(username);
          activeCalls.delete(partner);
          const partnerSocketId = getSocketId(partner);
          if (partnerSocketId) io.to(partnerSocketId).emit('call:ended', { from: username });
        }
        // Cleanup group
        if (groupCallUsers.has(username)) {
          groupCallUsers.delete(username);
          for (const u of groupCallUsers) {
            const sid = getSocketId(u);
            if (sid) io.to(sid).emit('call:user-left-group', { username });
          }
          io.emit('call:group-participants', Array.from(groupCallUsers));
        }

        onlineUsers.delete(socketId);
        socket.broadcast.emit('user:left', username);
        io.emit('user:online', Array.from(onlineUsers.values()));
      }
    }
  });
};
