/**
 * WebRTC service — centralised ICE configuration and peer connection factory.
 *
 * STUN servers allow NAT traversal on most home/office networks.
 * For production deployments behind symmetric NAT / strict firewalls,
 * add TURN credentials via environment variables (see README).
 */

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TURN added via env vars in production — example:
  // {
  //   urls: import.meta.env.VITE_TURN_URL,
  //   username: import.meta.env.VITE_TURN_USERNAME,
  //   credential: import.meta.env.VITE_TURN_CREDENTIAL,
  // },
];

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: ICE_SERVERS,
};

/** Create a new RTCPeerConnection with the project ICE config. */
export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection(RTC_CONFIG);
}

/** Request audio-only media stream. */
export async function getAudioStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
}

/** Request audio + video media stream. */
export async function getVideoStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: true });
}

/** Stop all tracks on a stream and release hardware. */
export function stopStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}
