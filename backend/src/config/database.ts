import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI as string;
    
    // Check if local MongoDB is available, otherwise use in-memory
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      try {
        console.log('Attempting to connect to local MongoDB...');
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (e) {
        console.log('Local MongoDB not found. Starting in-memory MongoDB for development...');
      }
    }

    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    
    const conn = await mongoose.connect(memoryUri);
    console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
