import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URI = process.env.DATABASE_URL as string
if (!MONGODB_URI) {
    throw new Error('MONGODB_URI шалгах хэрэгтэй');
  }
  declare global {
    namespace NodeJS {
      interface Global {
        mongoose: {
          conn: typeof mongoose | null;
          promise: Promise<typeof mongoose> | null;
        };
      }
    }
  }
  
  let cached = (global as any).mongoose;
  
  if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
  }
  
  async function dbConnect() {
    if (cached.conn) {
      return cached.conn;
    }
  
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
          };
      
  
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('✅ Connected to MongoDB');
        return mongoose;
      }).catch(err => {
        console.error('❌ MongoDB connection error:', err);
        throw err;
      });
    }
  
    try {
      cached.conn = await cached.promise;
    } catch (e) {
      cached.promise = null;
      console.error('❌ Failed to connect MongoDB', e);
      throw e;
    }
  
    return cached.conn;
  }
  
  export default dbConnect;