import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { getTeacherMe, updateTeacherMe, getInstitutionMe, updateInstitutionMe } from '../controllers/profileController';

const router = Router();

router.get('/teachers/me', requireAuth(['teacher']), getTeacherMe);
router.put(
  '/teachers/me',
  requireAuth(['teacher']),
  body('name').optional().isString(),
  body('phone').optional().isString(),
  body('city').optional().isString(),
  body('qualification').optional().isString(),
  updateTeacherMe
);

router.get('/institutions/me', requireAuth(['institution']), getInstitutionMe);
router.put(
  '/institutions/me',
  requireAuth(['institution']),
  body('org_name').optional().isString(),
  body('contact_person').optional().isString(),
  body('city').optional().isString(),
  body('contact_info').optional().isString(),
  body('description').optional().isString(),
  updateInstitutionMe
);

export default router;
