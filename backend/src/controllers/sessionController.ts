import { Request, Response } from 'express';
import { Session } from '../models/Session';
import { AuthRequest } from '../middleware/auth';

function buildJitsiLink(title: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const room = `TeacherPortal-${slug}-${Date.now()}`;
  return `https://meet.jit.si/${room}`;
}

export async function createSession(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { title, description, startTime, duration } = req.body as any;
  const meetingLink = buildJitsiLink(title);
  const doc = await Session.create({
    hostId: req.user.sub,
    title,
    description,
    startTime,
    duration,
    meetingLink,
    provider: 'Jitsi',
  });
  res.status(201).json(doc);
}

export async function getSession(req: Request, res: Response) {
  const { id } = req.params;
  const doc = await Session.findById(id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
}
