# Vedaz

> A real-time web chat application featuring global messaging, online presence, and seamless 1-on-1 & group audio/video calls, accessible by simply creating a single Room Code.

## Features

- **Instant Messaging**: Real-time communication powered by Socket.io, with history persisted via MongoDB.
- **Audio & Video Calls**: Built-in peer-to-peer 1-on-1 and group calls using WebRTC. No third-party video API required.
- **WhatsApp-style UI**: A clean, responsive interface featuring dynamic animations, typing indicators, and read receipts.
- **Call Logging**: In-chat system messages track when calls are started, missed, or ended.
- **Zero Friction**: Join simply by picking a username/room code. No complex signup flows.

## Technology Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS
- Socket.io Client
- WebRTC

**Backend:**
- Node.js
- Express
- TypeScript
- Socket.io
- MongoDB & Mongoose

## Installation & Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via Atlas)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adil-r120/Vedaz.git
   cd Vedaz
   ```

2. **Install and run the Backend:**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example with your MongoDB URI
   npm run dev
   ```

3. **Install and run the Frontend:**
   ```bash
   # Open a new terminal window
   cd frontend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173` to test the application. Open it in two different tabs/browsers to test the real-time features.

## Architecture Highlights

- **WebRTC for Calls**: Audio/video streams are exchanged directly peer-to-peer, minimizing server load. The backend only relays the initial signaling (SDP and ICE candidates).
- **Socket Signaling**: Socket.io handles all text messaging, presence updates, and call signaling in real-time.
- **Global Room System**: Currently implemented as a unified room experience where all participants entering the same server can instantly communicate.

## Deployment

### Backend (Render / Railway)
1. Set the Root Directory to `backend/`.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Set Environment Variables: `MONGODB_URI`, `CLIENT_URL` (pointing to your frontend).

### Frontend (Vercel)
1. Import repository and set Framework to `Vite`.
2. Set Root Directory to `frontend/`.
3. Set Environment Variables: `VITE_API_URL` (backend URL + `/api`), `VITE_SOCKET_URL` (backend URL).
4. Deploy!