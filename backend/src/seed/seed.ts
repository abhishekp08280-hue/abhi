import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/teacher_portal';
  await mongoose.connect(uri);

  await User.deleteMany({ email: { $in: ['teacher@example.com', 'inst@example.com'] } });

  const teacher = await User.create({
    email: 'teacher@example.com',
    passwordHash: await bcrypt.hash('Password123', 10),
    role: 'teacher',
    isVerified: true,
  });

  const inst = await User.create({
    email: 'inst@example.com',
    passwordHash: await bcrypt.hash('Password123', 10),
    role: 'institution',
    isVerified: true,
  });

  console.log({ teacher: teacher.email, inst: inst.email });
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
