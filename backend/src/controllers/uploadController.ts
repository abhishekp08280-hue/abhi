import { Request, Response } from 'express';
import path from 'path';

export function uploadResume(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ message: 'File is required' });
  const url = `/uploads/resumes/${path.basename(file.path)}`;
  res.json({ url });
}

export function uploadCertificate(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ message: 'File is required' });
  const url = `/uploads/certificates/${path.basename(file.path)}`;
  res.json({ url });
}

export function uploadMaterial(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ message: 'File is required' });
  const url = `/uploads/materials/${path.basename(file.path)}`;
  res.json({ url });
}
