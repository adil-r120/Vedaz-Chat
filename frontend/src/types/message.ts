export interface IMessage {
  _id: string;
  username: string;
  message: string;
  status: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'call';
  createdAt: string;
  updatedAt: string;
}
