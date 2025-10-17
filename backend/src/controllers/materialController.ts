import { Request, Response } from 'express';
import { StudyMaterial } from '../models/StudyMaterial';
import { AuthRequest } from '../middleware/auth';

export async function uploadMaterialMeta(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { title, subject, classGrade, fileUrl, linkUrl } = req.body as any;
  const doc = await StudyMaterial.create({
    uploaderId: req.user.sub,
    title,
    subject,
    classGrade,
    fileUrl,
    linkUrl,
  });
  res.status(201).json(doc);
}

export async function listMaterials(req: Request, res: Response) {
  const { q, subject, classGrade } = req.query as any;
  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (subject) filter.subject = subject;
  if (classGrade) filter.classGrade = classGrade;
  const docs = await StudyMaterial.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(docs);
}
