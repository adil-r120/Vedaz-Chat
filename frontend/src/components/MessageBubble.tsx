import React, { useEffect, useRef } from 'react';
import type { IMessage } from '../types/message';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: IMessage;
  isOwnMessage: boolean;
  onRead: (messageId: string) => void;
  isSequential?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwnMessage, 
  onRead,
  isSequential = false 
}) => {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOwnMessage && message.status !== 'read') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onRead(message._id);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      if (messageRef.current) {
        observer.observe(messageRef.current);
      }

      return () => observer.disconnect();
    }
  }, [message._id, message.status, isOwnMessage, onRead]);

  const timeString = new Date(message.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (message.type === 'call') {
    return (
      <div className="flex justify-center w-full my-3" ref={messageRef}>
        <div className="bg-gray-100/80 text-gray-600 text-[11px] font-medium px-4 py-1.5 rounded-full border border-gray-200/50 shadow-sm flex items-center gap-2">
          <span>{message.message}</span>
          <span className="text-gray-400 text-[9px] ml-1">{timeString}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={messageRef} 
      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} ${isSequential ? 'mt-1' : 'mt-4'}`}
    >
      {!isOwnMessage && !isSequential && (
        <span className="text-xs font-semibold text-gray-500 mb-1 ml-1">{message.username}</span>
      )}
      
      <div className={`
        relative max-w-[75%] px-4 py-2.5 shadow-sm group
        ${isOwnMessage 
          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' 
          : 'bg-white text-gray-800 border border-gray-100'}
        ${isOwnMessage
          ? `rounded-l-2xl ${isSequential ? 'rounded-r-md' : 'rounded-tr-2xl rounded-br-sm'}`
          : `rounded-r-2xl ${isSequential ? 'rounded-l-md' : 'rounded-tl-2xl rounded-bl-sm'}`}
      `}>
        <p className="text-[15px] leading-relaxed break-words">{message.message}</p>
        
        <div className={`
          flex items-center gap-1 mt-1 text-[10px] opacity-70 justify-end
          ${isOwnMessage ? 'text-indigo-100' : 'text-gray-400'}
        `}>
          <span>{timeString}</span>
          {isOwnMessage && (
            <span className="ml-1">
              {message.status === 'read' ? (
                <CheckCheck size={14} className="text-blue-200" />
              ) : message.status === 'sent' ? (
                <Check size={14} />
              ) : (
                <span className="opacity-50">...</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
