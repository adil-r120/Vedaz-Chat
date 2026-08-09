import express from 'express';
import cors from 'cors';
import messageRoutes from './routes/message.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// Routes
app.use('/api/messages', messageRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
