export type CallType = 'audio' | 'video';

export interface RemoteParticipant {
  username: string;
  stream: MediaStream | null;
}

export type CallMode = 'idle' | 'p2p' | 'group';

export type CallState = 
  | 'idle'
  | 'calling'
  | 'incoming'
  | 'connecting'
  | 'connected'
  | 'rejected'
  | 'busy'
  | 'ended'
  | 'failed'
  // Group call specific states
  | 'joining'
  | 'group-connected';
