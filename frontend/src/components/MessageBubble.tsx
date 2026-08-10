import React, { useEffect, useRef, useState } from 'react';
import type { IMessage } from '../types/message';
import { Check, CheckCheck, Pencil, Trash2, X, Check as CheckIcon } from 'lucide-react';

interface MessageBubbleProps {
  message: IMessage;
  isOwnMessage: boolean;
  onRead: (messageId: string) => void;
  isSequential?: boolean;
  onEdit?: (messageId: string, newMessage: string) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwnMessage, 
  onRead,
  isSequential = false,
  onEdit,
  onDelete
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.message);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

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

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isOwnMessage || message.type === 'call') return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editValue.trim() && editValue !== message.message) {
      onEdit?.(message._id, editValue);
    }
    setIsEditing(false);
  };

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

  const canEdit = message.status !== 'read';

  return (
    <>
      <div 
        ref={messageRef} 
        className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} ${isSequential ? 'mt-1' : 'mt-4'}`}
      >
        {!isOwnMessage && !isSequential && (
          <span className="text-xs font-semibold text-gray-500 mb-1 ml-1">{message.username}</span>
        )}
        
        <div 
          onContextMenu={handleContextMenu}
          className={`
          relative max-w-[75%] px-4 py-2.5 shadow-sm group
          ${isOwnMessage 
            ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' 
            : 'bg-white text-gray-800 border border-gray-100'}
          ${isOwnMessage
            ? `rounded-l-2xl ${isSequential ? 'rounded-r-md' : 'rounded-tr-2xl rounded-br-sm'}`
            : `rounded-r-2xl ${isSequential ? 'rounded-l-md' : 'rounded-tl-2xl rounded-bl-sm'}`}
        `}>
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
              <input 
                type="text" 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)}
                className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded px-2 py-1 text-[15px] outline-none focus:bg-white/30"
                autoFocus
              />
              <button type="submit" className="p-1 hover:bg-white/20 rounded-full transition-colors"><CheckIcon size={16} /></button>
              <button type="button" onClick={() => setIsEditing(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={16} /></button>
            </form>
          ) : (
            <p className="text-[15px] leading-relaxed break-words">{message.message}</p>
          )}
        
        <div className={`
          flex items-center gap-1 mt-1 text-[10px] opacity-70 justify-end
          ${isOwnMessage ? 'text-indigo-100' : 'text-gray-400'}
        `}>
          <span>{timeString}</span>
          {isOwnMessage && (
            <span className="ml-1">
              {message.status === 'read' ? (
                <CheckCheck size={14} className="text-[#34B7F1]" />
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
    
    {contextMenu && (
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[120px]"
        style={{ top: contextMenu.y, left: contextMenu.x }}
        onClick={(e) => e.stopPropagation()}
      >
        {canEdit && (
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              setIsEditing(true);
              setContextMenu(null);
            }}
          >
            <Pencil size={14} />
            Edit
          </button>
        )}
        <button 
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          onClick={() => {
            onDelete?.(message._id);
            setContextMenu(null);
          }}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    )}
    </>
  );
};
