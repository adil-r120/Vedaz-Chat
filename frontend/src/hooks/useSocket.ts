import { useEffect, useState, useCallback } from 'react';
import { socket } from '../services/socket';
import type { IMessage } from '../types/message';

interface UseSocketProps {
  username: string | null;
  onMessageReceived: (message: IMessage) => void;
  onUserStatusChange: (users: string[]) => void;
  onTypingUpdate: (typingData: { username: string; isTyping: boolean }) => void;
  onMessageReadUpdate: (messageId: string) => void;
  onMessageEdited?: (data: { messageId: string; newMessage: string }) => void;
  onMessageDeleted?: (messageId: string) => void;
}

export const useSocket = ({ 
  username, 
  onMessageReceived, 
  onUserStatusChange, 
  onTypingUpdate,
  onMessageReadUpdate,
  onMessageEdited,
  onMessageDeleted
}: UseSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    // Connect socket
    socket.connect();

    // Event listeners
    const onConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      socket.emit('user:join', username);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (error: Error) => {
      setConnectionError(error.message);
    };

    const onMessageNew = (message: IMessage) => {
      onMessageReceived(message);
    };

    const onUserOnline = (users: string[]) => {
      onUserStatusChange(users);
    };

    const onTypingUpdateEvent = (data: { username: string; isTyping: boolean }) => {
      onTypingUpdate(data);
    };

    const onMessageRead = (messageId: string) => {
      onMessageReadUpdate(messageId);
    };

    const onMessageEditedEvent = (data: { messageId: string; newMessage: string }) => {
      if (onMessageEdited) onMessageEdited(data);
    };

    const onMessageDeletedEvent = (messageId: string) => {
      if (onMessageDeleted) onMessageDeleted(messageId);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('message:new', onMessageNew);
    socket.on('user:online', onUserOnline);
    socket.on('typing:update', onTypingUpdateEvent);
    socket.on('message:read', onMessageRead);
    socket.on('message:edited', onMessageEditedEvent);
    socket.on('message:deleted', onMessageDeletedEvent);

    return () => {
      socket.emit('user:leave');
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('message:new', onMessageNew);
      socket.off('user:online', onUserOnline);
      socket.off('typing:update', onTypingUpdateEvent);
      socket.off('message:read', onMessageRead);
      socket.off('message:edited', onMessageEditedEvent);
      socket.off('message:deleted', onMessageDeletedEvent);
      socket.disconnect();
    };
  }, [username, onMessageReceived, onUserStatusChange, onTypingUpdate, onMessageReadUpdate, onMessageEdited, onMessageDeleted]);

  const sendSocketMessage = useCallback((message: string) => {
    if (username && isConnected) {
      socket.emit('message:send', { username, message });
    }
  }, [username, isConnected]);

  const sendTypingStart = useCallback(() => {
    if (username && isConnected) {
      socket.emit('typing:start', username);
    }
  }, [username, isConnected]);

  const sendTypingStop = useCallback(() => {
    if (username && isConnected) {
      socket.emit('typing:stop', username);
    }
  }, [username, isConnected]);
  
  const sendReadStatus = useCallback((messageId: string) => {
    if (isConnected) {
      socket.emit('message:read', messageId);
    }
  }, [isConnected]);

  const sendEditMessage = useCallback((messageId: string, newMessage: string) => {
    if (isConnected) {
      socket.emit('message:edit', { messageId, newMessage });
    }
  }, [isConnected]);

  const sendDeleteMessage = useCallback((messageId: string) => {
    if (isConnected) {
      socket.emit('message:delete', messageId);
    }
  }, [isConnected]);

  return { 
    isConnected, 
    connectionError, 
    sendSocketMessage, 
    sendTypingStart, 
    sendTypingStop,
    sendReadStatus,
    sendEditMessage,
    sendDeleteMessage
  };
};
