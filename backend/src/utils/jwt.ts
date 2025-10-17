import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  role: 'teacher' | 'institution';
}

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

export function signAccessToken(payload: JwtPayload, expiresIn: string = '15m') {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function signRefreshToken(payload: JwtPayload, expiresIn: string = '7d') {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
