import axios from 'axios';
import type { IMessage } from '../types/message';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const getMessages = async (): Promise<IMessage[]> => {
  const response = await api.get('/messages');
  return response.data.messages;
};

// We might not use this if we send messages via socket directly,
// but the requirements mention "POST /api/messages".
export const sendMessage = async (username: string, message: string): Promise<IMessage> => {
  const response = await api.post('/messages', { username, message });
  return response.data.message;
};
