import 'dotenv/config';
import mongoose from 'mongoose';
import http from 'http';
import app from './app';
import path from 'path';

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/teacher_portal';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const server = http.createServer(app);

    // Static file serving for uploads
    app.use('/uploads', (require('express') as any).static(path.join(process.cwd(), 'uploads')));

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
