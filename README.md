# Vedaz Real-Time Chat Application

## Overview

A complete, production-quality real-time chat application built as a technical assignment for Vedaz. The application features a clean, responsive SaaS-style UI and provides instant messaging using Socket.io and MongoDB.

## Features

- Real-time messaging with no polling
- Socket.io integration for instant communication
- Chat history persistence with MongoDB
- Username login (session-based)
- Typing indicator
- Online/offline status updates
- Message status indicators (sent, delivered, read)
- Clean, responsive, and accessible UI

## Technology Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS
- Socket.io Client
- Axios

**Backend:**
- Node.js
- Express
- TypeScript
- Socket.io
- MongoDB & Mongoose

## Project Structure

```
vedaz-realtime-chat/
├── frontend/             # React application (Vite + Tailwind)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Login and Chat pages
│   │   ├── hooks/        # Custom React hooks (useSocket)
│   │   ├── services/     # API and Socket connections
│   │   └── types/        # TypeScript interfaces
├── backend/              # Node.js server
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # REST API handlers
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # Express routes
│   │   └── socket/       # Socket.io event handlers
└── docker-compose.yml    # Optional local MongoDB setup
```

## Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

1. Clone the repository.
2. Install Backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install Frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaz-chat
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Running Backend

Start the local MongoDB instance (if using Docker):
```bash
docker-compose up -d
```

Start the backend server in development mode:
```bash
cd backend
npm run dev
```

## Running Frontend

Start the Vite development server:
```bash
cd frontend
npm run dev
```

## API Documentation

### `POST /api/messages`
Create and save a new message.
- **Request Body:**
  ```json
  {
    "username": "Adil",
    "message": "Hello World"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": {
      "_id": "60d5ec...",
      "username": "Adil",
      "message": "Hello World",
      "status": "sent",
      "createdAt": "2023-10-01T12:00:00Z"
    }
  }
  ```

### `GET /api/messages`
Retrieve message history (chronological order).
- **Response:**
  ```json
  {
    "success": true,
    "messages": [
      {
        "_id": "...",
        "username": "Adil",
        "message": "Hello",
        "status": "read",
        "createdAt": "..."
      }
    ]
  }
  ```

## Socket.io Events

**Client → Server:**
- `user:join` - Emitted when a user logs in.
- `user:leave` - Emitted when a user logs out.
- `message:send` - Sends a new message.
- `typing:start` - Emitted when user starts typing.
- `typing:stop` - Emitted when user stops typing.
- `message:read` - Marks a message as read.
- `call:initiate` - Initiates a call (`{ to, from, callType }`).
- `call:accept` - Accepts an incoming call (`{ to, from }`).
- `call:reject` - Rejects an incoming call (`{ to, from }`).
- `call:cancel` - Cancels an outgoing call before acceptance (`{ to, from }`).
- `call:end` - Ends an active call (`{ to, from }`).
- `call:offer` - Relays WebRTC SDP offer (`{ to, from, offer }`).
- `call:answer` - Relays WebRTC SDP answer (`{ to, from, answer }`).
- `call:ice-candidate` - Relays ICE candidate (`{ to, from, candidate }`).

**Server → Client:**
- `user:joined` - Broadcasts a new user joined.
- `user:left` - Broadcasts a user disconnected.
- `message:new` - Broadcasts a new message.
- `typing:update` - Broadcasts typing status changes.
- `user:online` - Updates the full list of online users.
- `message:read` - Broadcasts message read status update.
- `call:incoming` - Notifies a user of an incoming call.
- `call:accepted` - Notifies the caller that the call was accepted.
- `call:rejected` - Notifies the caller that the call was rejected.
- `call:cancelled` - Notifies the callee that the caller cancelled.
- `call:ended` - Notifies the other user that the call ended.
- `call:offer` - Relays SDP offer to the target user.
- `call:answer` - Relays SDP answer to the target user.
- `call:ice-candidate` - Relays ICE candidate to the target user.
- `call:busy` - Notifies the caller that the callee is already in a call.
- `call:error` - Notifies the caller of an error (e.g., offline user).

## Voice and Video Calling

The application includes real-time peer-to-peer voice and video calling.

### Architecture

- **WebRTC** is used for the actual peer-to-peer audio/video media connection.
- **Socket.io** is used for signaling only (exchanging SDP offers/answers and ICE candidates).
- The Node.js/Express backend **never transmits or stores audio/video data**.
- All media flows directly between browsers once the WebRTC handshake is complete.

### How it works

1. Caller clicks Voice or Video call button next to an online user.
2. Browser requests microphone/camera permission.
3. Caller sends `call:initiate` via Socket.io.
4. Server relays `call:incoming` to the callee.
5. Callee sees an incoming call modal and accepts or rejects.
6. On acceptance, SDP offer/answer and ICE candidates are exchanged through Socket.io.
7. WebRTC establishes a direct peer-to-peer connection.
8. Either user can end the call, which notifies the other and cleans up all media tracks.

### Call Features

- Voice calls with mute/unmute control
- Video calls with mute/unmute and camera enable/disable controls
- Call duration timer
- Busy detection (prevents multiple simultaneous calls per user)
- Clean media cleanup on call end, rejection, cancellation, or disconnection

### Permissions Required

- **Voice call**: Microphone access
- **Video call**: Microphone and camera access

If permission is denied, the user will see a descriptive error message and the call will not proceed.

### Browser Requirements

WebRTC is supported in all modern browsers (Chrome, Firefox, Edge, Safari 11+). The application must be accessed over:
- `http://localhost` (development), or
- `https://` (production)

> **Note for production deployments**: WebRTC works well for direct peer-to-peer connections over most networks. Users behind **symmetric NAT** or **restrictive firewalls** may require a **TURN server** for reliable connectivity. To add TURN support, set the following environment variables in `frontend/.env`:
>
> ```
> VITE_TURN_URL=turn:your-turn-server.com:3478
> VITE_TURN_USERNAME=your-username
> VITE_TURN_CREDENTIAL=your-credential
> ```
>
> The ICE configuration in `frontend/src/services/webrtc.ts` is designed to accept these values without code changes.

## Design Decisions

- **React vs React Native:** React was chosen per the prompt requirements, focusing on a robust web implementation using Vite for rapid development.
- **Socket.io:** Used for seamless real-time WebSocket communication, with automatic fallback and reconnection capabilities.
- **MongoDB:** A NoSQL database is ideal for unstructured chat messages, and Mongoose provides an excellent schema validation layer.
- **Connection Tracking:** An in-memory Map tracks `socketId` to `username` to instantly reflect who is online without heavy DB polling.

## Assumptions
- Usernames are unique for the current session.
- Authentication is simplified to session storage per the assignment requirements.

## Testing
1. Start MongoDB, backend, and frontend.
2. Open two different browsers (or one incognito window).
3. Log in with two different usernames (e.g., "UserA" and "UserB").
4. Send messages back and forth. You will see instant delivery, typing indicators, and read receipts.
5. Refresh the page to verify historical message persistence.

 # #   D e p l o y m e n t 
 
 * * B a c k e n d   ( R e n d e r / R a i l w a y ) : * * 
 1 .   C r e a t e   a   n e w   W e b   S e r v i c e . 
 2 .   C o n n e c t   y o u r   G i t H u b   r e p o s i t o r y . 
 3 .   S e t   t h e   R o o t   D i r e c t o r y   t o   \  a c k e n d \ . 
 4 .   B u i l d   C o m m a n d :   \ 
 p m   i n s t a l l   & &   n p m   r u n   b u i l d \ 
 5 .   S t a r t   C o m m a n d :   \ 
 p m   s t a r t \ 
 6 .   A d d   E n v i r o n m e n t   V a r i a b l e s :   \ M O N G O D B _ U R I \ ,   \ C L I E N T _ U R L \   ( p o i n t i n g   t o   y o u r   V e r c e l   f r o n t e n d   U R L ) . 
 
 * * F r o n t e n d   ( V e r c e l ) : * * 
 1 .   I m p o r t   y o u r   G i t H u b   r e p o s i t o r y   t o   V e r c e l . 
 2 .   S e t   t h e   F r a m e w o r k   P r e s e t   t o   \ V i t e \ . 
 3 .   S e t   t h e   R o o t   D i r e c t o r y   t o   \  r o n t e n d \ . 
 4 .   A d d   E n v i r o n m e n t   V a r i a b l e s :   \ V I T E _ A P I _ U R L \   ( p o i n t i n g   t o   b a c k e n d   U R L   +   \ / a p i \ ) ,   \ V I T E _ S O C K E T _ U R L \   ( p o i n t i n g   t o   b a c k e n d   U R L ) . 
 5 .   D e p l o y . 
 
 # #   D e m o 
 * [ I n s e r t   D e m o   V i d e o   L i n k   H e r e ] * 
  
 