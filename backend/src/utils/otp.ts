import bcrypt from 'bcrypt';
import crypto from 'crypto';

export function generateOtp(length: number = 6): string {
  const code = crypto.randomInt(0, 10 ** length).toString().padStart(length, '0');
  return code;
}

export async function hashOtp(otp: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(otp, saltRounds);
}

export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}
