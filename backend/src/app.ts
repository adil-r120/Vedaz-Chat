import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import messageRoutes from './routes/message.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST'],
}));

// Security Headers
app.use(helmet());

// Rate limiting: max 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Parse JSON payload
app.use(express.json({ limit: '10kb' })); // Limit body payload to 10kb to prevent payload too large attacks

// Data Sanitization against NoSQL query injection
// Note: express-mongo-sanitize is incompatible with Express 5 as req.query is a getter.
// app.use(mongoSanitize());

// Routes
app.use('/api/messages', messageRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
