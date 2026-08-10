import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    onTypingStart();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, 2000);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
      onTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="shrink-0 p-4 border-t border-gray-100/50 bg-white/40 backdrop-blur-md relative">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto relative w-full">
        <div className="flex-1 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 flex items-center p-1 pl-2 pr-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-all">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <Smile size={24} />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={handleTextChange}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:outline-none py-3 px-3 text-gray-700 placeholder-gray-400"
          />
          
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md active:scale-95"
          >
            <Send size={20} className={message.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </div>

        {showEmojiPicker && (
          <div ref={pickerRef} className="absolute bottom-[110%] left-0 z-50 shadow-2xl">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
      </form>
    </div>
  );
};

