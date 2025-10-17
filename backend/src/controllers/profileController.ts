import { Request, Response } from 'express';
import { TeacherProfile } from '../models/TeacherProfile';
import { InstitutionProfile } from '../models/InstitutionProfile';
import { AuthRequest } from '../middleware/auth';

export async function getTeacherMe(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
  const profile = await TeacherProfile.findOne({ userId: req.user.sub });
  res.json(profile || {});
}

export async function updateTeacherMe(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
  const { name, phone, city, qualification } = req.body as any;
  const profile = await TeacherProfile.findOneAndUpdate(
    { userId: req.user.sub },
    { $set: { name, phone, city, qualification } },
    { upsert: true, new: true }
  );
  res.json(profile);
}

export async function getInstitutionMe(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'institution') return res.status(403).json({ message: 'Forbidden' });
  const profile = await InstitutionProfile.findOne({ userId: req.user.sub });
  res.json(profile || {});
}

export async function updateInstitutionMe(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'institution') return res.status(403).json({ message: 'Forbidden' });
  const { org_name, contact_person, city, contact_info, description } = req.body as any;
  const profile = await InstitutionProfile.findOneAndUpdate(
    { userId: req.user.sub },
    { $set: { org_name, contact_person, city, contact_info, description } },
    { upsert: true, new: true }
  );
  res.json(profile);
}
