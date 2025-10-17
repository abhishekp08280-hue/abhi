import { Request, Response } from 'express';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendMailOnApply } from '../services/notifyService';

export async function createJob(req: AuthRequest, res: Response) {
  if (!req.user || req.user.role !== 'institution') return res.status(403).json({ message: 'Forbidden' });
  const { title, description, qualifications, city, salary, tags } = req.body as any;
  const job = await Job.create({ employerId: req.user.sub, title, description, qualifications, city, salary, tags });
  res.status(201).json(job);
}

export async function searchJobs(req: Request, res: Response) {
  const { q, city, tag } = req.query as any;
  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (city) filter.city = city;
  if (tag) filter.tags = tag;
  const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(jobs);
}

export async function applyJob(req: AuthRequest, res: Response) {
  if (!req.user || req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
  const { id } = req.params;
  const { coverLetter } = req.body as any;
  const application = await Application.create({ jobId: id, teacherId: req.user.sub, coverLetter, status: 'applied' });

  const job = await Job.findById(id);
  if (job) {
    const institution = await User.findById(job.employerId);
    if (institution) {
      await sendMailOnApply(institution.email, req.user.sub, job.title);
    }
  }

  res.status(201).json(application);
}

export async function getInstitutionJobs(req: AuthRequest, res: Response) {
  if (!req.user || req.user.role !== 'institution') return res.status(403).json({ message: 'Forbidden' });
  const jobs = await Job.find({ employerId: req.user.sub }).sort({ createdAt: -1 });
  res.json(jobs);
}

export async function getJobApplications(req: AuthRequest, res: Response) {
  if (!req.user || req.user.role !== 'institution') return res.status(403).json({ message: 'Forbidden' });
  const { id } = req.params;
  const apps = await Application.find({ jobId: id }).sort({ appliedAt: -1 });
  res.json(apps);
}
