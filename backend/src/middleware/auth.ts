import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(roles?: Array<'teacher' | 'institution'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const payload = verifyAccessToken(token);
      if (roles && !roles.includes(payload.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}
