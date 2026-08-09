import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import type { CallType, CallMode, CallState, RemoteParticipant } from '../types/call';

interface CallScreenProps {
  callState: CallState;
  callMode: CallMode;
  callType: CallType;
  remoteUser: string | null; // For P2P
  localStream: MediaStream | null;
  participants: RemoteParticipant[]; // Active remote streams
  isMuted: boolean;
  isCameraOff: boolean;
  callDuration: number;
  onEnd: () => void;
  onCancel: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  callState,
  callMode,
  callType,
  remoteUser,
  localStream,
  participants,
  isMuted,
  isCameraOff,
  callDuration,
  onEnd,
  onCancel,
  onToggleMute,
  onToggleCamera,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const p2pRemoteVideoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isConnecting = ['calling', 'connecting', 'joining'].includes(callState);
  let statusLabel = 'Connecting...';
  if (callState === 'calling') statusLabel = 'Ringing...';
  else if (callState === 'connecting') statusLabel = 'Connecting...';
  else if (callState === 'joining') statusLabel = 'Joining group...';
  else if (callState === 'connected' || callState === 'group-connected') statusLabel = formatDuration(callDuration);

  // ── Local Stream Binding ──
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // ── P2P Remote Stream Binding ──
  useEffect(() => {
    if (callMode === 'p2p' && p2pRemoteVideoRef.current && participants.length > 0) {
      p2pRemoteVideoRef.current.srcObject = participants[0].stream;
    }
  }, [participants, callMode]);


  // ── Render Group Grid ──
  const renderGroupGrid = () => {
    // Determine grid size based on participant count (including local)
    const count = participants.length + 1; 
    let cols = 1;
    if (count >= 2) cols = 2;
    if (count >= 5) cols = 3;
    if (count >= 10) cols = 4;

    return (
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '12px',
          width: '100%',
          height: '100%',
          padding: '16px',
          boxSizing: 'border-box'
        }}
      >
        {/* Local Video Cell */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#1f2937' }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isCameraOff ? 0 : 1 }}
          />
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 600 }}>
            You (Local)
          </div>
          {isCameraOff && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <VideoOff size={32} color="#6b7280" />
            </div>
          )}
        </div>

        {/* Remote Video Cells */}
        {participants.map((p) => (
          <div key={p.username} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#1f2937' }}>
            <video
              autoPlay
              playsInline
              ref={(el) => { if (el && p.stream) el.srcObject = p.stream; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {!p.stream && (
               <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Loader2 size={32} color="#6b7280" className="animate-spin" />
               </div>
            )}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 600 }}>
              {p.username}
            </div>
          </div>
        ))}
      </div>
    );
  };


  // ── Render P2P View ──
  const renderP2PView = () => {
    const hasRemoteVideo = callType === 'video' && participants.length > 0 && participants[0].stream;
    
    return (
      <>
        {/* Remote full-screen video */}
        {hasRemoteVideo ? (
          <video
            ref={p2pRemoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
            <div className="w-24 h-24 bg-indigo-600/30 rounded-full flex items-center justify-center text-5xl font-bold border-2 border-indigo-400/30">
              {remoteUser ? remoteUser.charAt(0).toUpperCase() : '?'}
            </div>
            <p className="text-xl font-semibold">{remoteUser}</p>
          </div>
        )}

        {/* Local PIP video */}
        {localStream && (
          <div className="absolute bottom-24 right-4 w-32 h-44 md:w-44 md:h-60 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-800 z-10">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCameraOff ? 'opacity-0' : ''}`}
            />
            {isCameraOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400">
                <VideoOff size={32} />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-medium">
              You
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col overflow-hidden backdrop-blur-xl">
      
      {/* Header Info */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        {callMode === 'group' && <span className="bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-2 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.3)]">Group Call</span>}
        <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-2xl text-white font-medium tracking-wide border border-white/10 shadow-xl flex items-center gap-3">
          {isConnecting && <Loader2 size={16} className="animate-spin text-indigo-400" />}
          {statusLabel}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full">
        {callMode === 'group' ? renderGroupGrid() : renderP2PView()}
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-6 z-20">
        
        <button
          onClick={onToggleMute}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
            isMuted 
              ? 'bg-red-500/90 hover:bg-red-600 text-white' 
              : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'
          }`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={onToggleCamera}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
            isCameraOff 
              ? 'bg-red-500/90 hover:bg-red-600 text-white' 
              : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'
          }`}
        >
          {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button
          onClick={callState === 'calling' ? onCancel : onEnd}
          className="w-16 h-16 rounded-3xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform active:scale-95 ml-4"
        >
          <PhoneOff size={26} />
        </button>

      </div>
    </div>
  );
};
