import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import type { CallType } from '../types/call';

interface IncomingCallModalProps {
  callerName: string;
  callType: CallType;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callerName,
  callType,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-fade-in-up">
        {/* Animated ring */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-30 animate-ping" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">
              {callerName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <p className="text-sm text-indigo-500 font-semibold uppercase tracking-widest mb-1">
          Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{callerName}</h2>

        <div className="flex items-center justify-center gap-8">
          {/* Reject */}
          <button
            onClick={onReject}
            aria-label="Reject call"
            className="flex flex-col items-center gap-2 group"
          >
            <span className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shadow-md group-hover:bg-red-500 transition-colors">
              <PhoneOff size={28} className="text-red-500 group-hover:text-white transition-colors" />
            </span>
            <span className="text-xs font-medium text-gray-500">Reject</span>
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            aria-label="Accept call"
            className="flex flex-col items-center gap-2 group"
          >
            <span className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shadow-md group-hover:bg-emerald-500 transition-colors">
              {callType === 'video' ? (
                <Video size={28} className="text-emerald-500 group-hover:text-white transition-colors" />
              ) : (
                <Phone size={28} className="text-emerald-500 group-hover:text-white transition-colors" />
              )}
            </span>
            <span className="text-xs font-medium text-gray-500">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
