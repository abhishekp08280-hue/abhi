import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { applyJob, createJob, getInstitutionJobs, getJobApplications, searchJobs } from '../controllers/jobController';

const router = Router();

router.post(
  '/jobs',
  requireAuth(['institution']),
  body('title').isString(),
  body('description').isString(),
  body('qualifications').optional().isString(),
  body('city').optional().isString(),
  body('salary').optional().isString(),
  body('tags').optional().isArray(),
  createJob
);

router.get('/jobs', searchJobs);
router.post('/jobs/:id/apply', requireAuth(['teacher']), body('coverLetter').optional().isString(), applyJob);
router.get('/institutions/jobs', requireAuth(['institution']), getInstitutionJobs);
router.get('/institutions/jobs/:id/applications', requireAuth(['institution']), getJobApplications);

export default router;
