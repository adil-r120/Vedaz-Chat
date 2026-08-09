import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  username: string;
  message: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'call';
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    type: {
      type: String,
      enum: ['text', 'call'],
      default: 'text',
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
