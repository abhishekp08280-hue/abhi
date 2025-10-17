import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { User } from '../models/User';
import { Otp } from '../models/Otp';
import { RefreshToken } from '../models/RefreshToken';
import { generateOtp, hashOtp, verifyOtp as verifyOtpHash } from '../utils/otp';
import { sendOtpEmail } from '../services/mailService';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

const OTP_TTL_MINUTES = 10;

export async function register(req: Request, res: Response) {
  try {
    const { email, password, role } = req.body as { email: string; password: string; role: 'teacher' | 'institution' };
    if (!email || !password || !role) return res.status(400).json({ message: 'email, password, role required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role, isVerified: false });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    await Otp.create({
      userId: user._id,
      otpHash,
      purpose: 'register',
      expiresAt: dayjs().add(OTP_TTL_MINUTES, 'minute').toDate(),
      used: false,
    });

    await sendOtpEmail(email, otp);

    res.status(201).json({ message: 'User created. OTP sent to email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body as { email: string; otp: string };
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const record = await Otp.findOne({ userId: user._id, purpose: 'register', used: false }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: 'OTP not found' });
    if (record.expiresAt.getTime() < Date.now()) return res.status(400).json({ message: 'OTP expired' });

    const ok = await verifyOtpHash(otp, record.otpHash);
    if (!ok) return res.status(400).json({ message: 'Invalid OTP' });

    record.used = true;
    await record.save();

    user.isVerified = true;
    await user.save();

    res.json({ message: 'Email verified. You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ message: 'Email not verified' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { sub: String(user._id), role: user.role } as const;
    const accessToken = signAccessToken(payload, '15m');
    const refreshToken = signRefreshToken(payload, process.env.REFRESH_TTL || '7d');

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const ttlDays = (process.env.REFRESH_TTL || '7d');
    const expiresAt = dayjs().add(7, 'day').toDate();
    await RefreshToken.create({ userId: user._id, tokenHash, expiresAt, revoked: false });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const records = await RefreshToken.find({ userId: payload.sub, revoked: false });
    const ok = await Promise.all(records.map(r => bcrypt.compare(refreshToken, r.tokenHash)));
    if (!ok.some(Boolean)) return res.status(401).json({ message: 'Refresh token not recognized' });

    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role }, '15m');
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    const payload = verifyRefreshToken(refreshToken);
    const records = await RefreshToken.find({ userId: payload.sub, revoked: false });
    for (const r of records) {
      const match = await bcrypt.compare(refreshToken, r.tokenHash);
      if (match) {
        r.revoked = true;
        await r.save();
      }
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
