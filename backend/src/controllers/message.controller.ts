import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/Message';

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, message } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const newMessage = await Message.create({
      username: username.trim(),
      message: message.trim(),
      status: 'sent',
    });

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    
    // Fetch latest messages, but sort them chronologically
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
      
    // Reverse to chronological order (oldest first)
    messages.reverse();

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};
