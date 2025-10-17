import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { listMaterials, uploadMaterialMeta } from '../controllers/materialController';

const router = Router();

router.post(
  '/materials',
  requireAuth(['teacher', 'institution']),
  body('title').isString(),
  body('subject').isString(),
  body('classGrade').isString(),
  uploadMaterialMeta
);

router.get('/materials', listMaterials);

export default router;
