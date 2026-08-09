import { useState, useRef, useCallback, useEffect } from 'react';
import { socket } from '../services/socket';
import {
  createPeerConnection,
  getAudioStream,
  getVideoStream,
  stopStream,
} from '../services/webrtc';
import type { CallType, CallMode, CallState, RemoteParticipant } from '../types/call';

interface UseCallProps {
  username: string;
}

export interface CallHookReturn {
  callState: CallState;
  callMode: CallMode;
  callType: CallType | null;
  remoteUser: string | null; // For P2P
  localStream: MediaStream | null;
  participants: RemoteParticipant[]; // Active remote streams (for both P2P and Group)
  groupParticipantsList: string[]; // Everyone in the global group call
  isMuted: boolean;
  isCameraOff: boolean;
  callDuration: number;

  // P2P Methods
  startCall: (targetUser: string, type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  cancelCall: () => void;
  endCall: () => void;

  // Group Methods
  joinGroupCall: (type: CallType) => Promise<void>;
  leaveGroupCall: () => void;

  // Shared
  toggleMute: () => void;
  toggleCamera: () => void;
}

export function useCall({ username }: UseCallProps): CallHookReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callMode, setCallMode] = useState<CallMode>('idle');
  const [callType, setCallType] = useState<CallType | null>(null);
  
  // P2P State
  const [remoteUser, setRemoteUser] = useState<string | null>(null);
  
  // Group / Shared State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [groupParticipantsList, setGroupParticipantsList] = useState<string[]>([]);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Refs for callbacks
  const callModeRef = useRef<CallMode>('idle');
  const remoteUserRef = useRef<string | null>(null);
  const callTypeRef = useRef<CallType | null>(null);
  
  // WebRTC Refs
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iceCandidateQueuesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // ── Helper: Timer ───────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (!timerRef.current) {
      setCallDuration(0);
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallDuration(0);
  }, []);

  // ── Helper: Peer Lifecycle ──────────────────────────────────────────────────
  const removePeer = useCallback((peerUsername: string) => {
    const pc = peersRef.current.get(peerUsername);
    if (pc) {
      pc.close();
      peersRef.current.delete(peerUsername);
    }
    iceCandidateQueuesRef.current.delete(peerUsername);
    setParticipants((prev) => prev.filter((p) => p.username !== peerUsername));
  }, []);

  const cleanup = useCallback(() => {
    for (const pc of peersRef.current.values()) {
      pc.close();
    }
    peersRef.current.clear();
    iceCandidateQueuesRef.current.clear();

    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    setLocalStream(null);
    setParticipants([]);

    stopTimer();
    setIsMuted(false);
    setIsCameraOff(false);
  }, [stopTimer]);

  const resetToIdle = useCallback(() => {
    cleanup();
    setCallState('idle');
    setCallMode('idle');
    setCallType(null);
    setRemoteUser(null);
    
    callModeRef.current = 'idle';
    callTypeRef.current = null;
    remoteUserRef.current = null;
  }, [cleanup]);

  const drainIceCandidates = useCallback(async (peerUsername: string) => {
    const pc = peersRef.current.get(peerUsername);
    const queue = iceCandidateQueuesRef.current.get(peerUsername);
    if (!pc || !queue) return;

    for (const candidate of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (_) {}
    }
    iceCandidateQueuesRef.current.set(peerUsername, []);
  }, []);

  const buildPeerConnection = useCallback((peerUsername: string): RTCPeerConnection => {
    if (peersRef.current.has(peerUsername)) {
      removePeer(peerUsername);
    }

    const pc = createPeerConnection();
    peersRef.current.set(peerUsername, pc);

    pc.ontrack = (event) => {
      setParticipants((prev) => {
        const existing = prev.find((p) => p.username === peerUsername);
        if (existing) {
          return prev.map((p) => p.username === peerUsername ? { ...p, stream: event.streams[0] } : p);
        }
        return [...prev, { username: peerUsername, stream: event.streams[0] }];
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('call:ice-candidate', {
          to: peerUsername,
          from: username,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        if (callModeRef.current === 'p2p') {
          setCallState('connected');
          startTimer();
        }
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        if (callModeRef.current === 'p2p') {
          setCallState('failed');
          cleanup();
        } else {
          removePeer(peerUsername);
        }
      }
    };

    return pc;
  }, [username, removePeer, startTimer, cleanup]);

  // ═════════════════════════════════════════════════════════════════════════
  // ── P2P METHODS ──────────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  const startCall = useCallback(async (targetUser: string, type: CallType) => {
    if (callState !== 'idle') return;

    try {
      const stream = type === 'video' ? await getVideoStream() : await getAudioStream();
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      remoteUserRef.current = targetUser;
      callTypeRef.current = type;
      callModeRef.current = 'p2p';
      
      setRemoteUser(targetUser);
      setCallType(type);
      setCallMode('p2p');
      setCallState('calling');

      socket.emit('call:initiate', { to: targetUser, from: username, callType: type });
    } catch (err) {
      alert('Could not access media devices.');
      resetToIdle();
    }
  }, [callState, username, resetToIdle]);

  const acceptCall = useCallback(async () => {
    if (callState !== 'incoming' || !remoteUserRef.current || !callTypeRef.current) return;

    try {
      const stream = callTypeRef.current === 'video' ? await getVideoStream() : await getAudioStream();
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCallState('connecting');

      socket.emit('call:accept', { to: remoteUserRef.current, from: username });
    } catch (err) {
      alert('Could not access media devices.');
      socket.emit('call:reject', { to: remoteUserRef.current!, from: username });
      resetToIdle();
    }
  }, [callState, username, resetToIdle]);

  const rejectCall = useCallback(() => {
    if (remoteUserRef.current) socket.emit('call:reject', { to: remoteUserRef.current, from: username });
    resetToIdle();
  }, [username, resetToIdle]);

  const cancelCall = useCallback(() => {
    if (remoteUserRef.current) socket.emit('call:cancel', { to: remoteUserRef.current, from: username });
    resetToIdle();
  }, [username, resetToIdle]);

  const endCall = useCallback(() => {
    if (remoteUserRef.current) socket.emit('call:end', { to: remoteUserRef.current, from: username });
    resetToIdle();
  }, [username, resetToIdle]);


  // ═════════════════════════════════════════════════════════════════════════
  // ── GROUP CALL METHODS ───────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  const joinGroupCall = useCallback(async (type: CallType) => {
    if (callState !== 'idle') return;

    try {
      setCallState('joining');
      setCallMode('group');
      setCallType(type);
      callModeRef.current = 'group';
      callTypeRef.current = type;

      const stream = type === 'video' ? await getVideoStream() : await getAudioStream();
      localStreamRef.current = stream;
      setLocalStream(stream);

      socket.emit('call:join-group', { username, callType: type }, async (existingParticipants: string[]) => {
        setCallState('group-connected');
        startTimer();

        for (const peerUsername of existingParticipants) {
          if (peerUsername === username) continue;

          const pc = buildPeerConnection(peerUsername);
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('call:offer', { to: peerUsername, from: username, offer });
        }
      });
    } catch (err) {
      alert('Could not access media devices.');
      resetToIdle();
    }
  }, [callState, username, startTimer, buildPeerConnection, resetToIdle]);

  const leaveGroupCall = useCallback(() => {
    socket.emit('call:leave-group', { username });
    resetToIdle();
  }, [username, resetToIdle]);


  // ═════════════════════════════════════════════════════════════════════════
  // ── MEDIA METHODS ────────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((m) => !m);
  }, []);

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsCameraOff((c) => !c);
  }, []);


  // ═════════════════════════════════════════════════════════════════════════
  // ── SOCKET LISTENERS ─────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    // ── P2P Events ──
    const onIncoming = (data: { from: string; callType: CallType }) => {
      if (callState !== 'idle') return;
      remoteUserRef.current = data.from;
      callTypeRef.current = data.callType;
      callModeRef.current = 'p2p';
      setRemoteUser(data.from);
      setCallType(data.callType);
      setCallMode('p2p');
      setCallState('incoming');
    };

    const onAccepted = async () => {
      if (callModeRef.current !== 'p2p') return;
      setCallState('connecting');
      if (!localStreamRef.current || !remoteUserRef.current) return;

      const pc = buildPeerConnection(remoteUserRef.current);
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call:offer', { to: remoteUserRef.current, from: username, offer });
    };

    const onRejected = () => { if (callModeRef.current === 'p2p') { setCallState('rejected'); cleanup(); setTimeout(resetToIdle, 2500); } };
    const onCancelled = () => { if (callModeRef.current === 'p2p') resetToIdle(); };
    const onEnded = () => { if (callModeRef.current === 'p2p') { setCallState('ended'); cleanup(); setTimeout(resetToIdle, 2000); } };
    const onBusy = () => { if (callModeRef.current === 'p2p') { setCallState('busy'); cleanup(); setTimeout(resetToIdle, 2500); } };
    const onError = (data: { message: string }) => { alert(data.message); resetToIdle(); };


    // ── Group Events ──
    const onGroupParticipants = (users: string[]) => setGroupParticipantsList(users);
    
    const onUserJoinedGroup = (data: { username: string }) => {
      // Clean stale PC if any. They will send us an offer.
      removePeer(data.username);
    };
    
    const onUserLeftGroup = (data: { username: string }) => {
      removePeer(data.username);
    };


    // ── Shared Signaling Events ──
    const onOffer = async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      if (!localStreamRef.current || callModeRef.current === 'idle') return;

      const pc = buildPeerConnection(data.from);
      localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      await drainIceCandidates(data.from);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { to: data.from, from: username, answer });
    };

    const onAnswer = async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peersRef.current.get(data.from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      await drainIceCandidates(data.from);
    };

    const onIceCandidate = async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peersRef.current.get(data.from);
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (_) {}
      } else {
        const q = iceCandidateQueuesRef.current.get(data.from) || [];
        q.push(data.candidate);
        iceCandidateQueuesRef.current.set(data.from, q);
      }
    };


    // Register
    socket.on('call:incoming', onIncoming);
    socket.on('call:accepted', onAccepted);
    socket.on('call:rejected', onRejected);
    socket.on('call:cancelled', onCancelled);
    socket.on('call:ended', onEnded);
    socket.on('call:busy', onBusy);
    socket.on('call:error', onError);

    socket.on('call:group-participants', onGroupParticipants);
    socket.on('call:user-joined-group', onUserJoinedGroup);
    socket.on('call:user-left-group', onUserLeftGroup);

    socket.on('call:offer', onOffer);
    socket.on('call:answer', onAnswer);
    socket.on('call:ice-candidate', onIceCandidate);

    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:accepted', onAccepted);
      socket.off('call:rejected', onRejected);
      socket.off('call:cancelled', onCancelled);
      socket.off('call:ended', onEnded);
      socket.off('call:busy', onBusy);
      socket.off('call:error', onError);
      
      socket.off('call:group-participants', onGroupParticipants);
      socket.off('call:user-joined-group', onUserJoinedGroup);
      socket.off('call:user-left-group', onUserLeftGroup);
      
      socket.off('call:offer', onOffer);
      socket.off('call:answer', onAnswer);
      socket.off('call:ice-candidate', onIceCandidate);
    };
  }, [callState, username, buildPeerConnection, drainIceCandidates, removePeer, cleanup, resetToIdle]);


  // ── Unmount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    callState,
    callMode,
    callType,
    remoteUser,
    localStream,
    participants,
    groupParticipantsList,
    isMuted,
    isCameraOff,
    callDuration,
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    joinGroupCall,
    leaveGroupCall,
    toggleMute,
    toggleCamera,
  };
}
