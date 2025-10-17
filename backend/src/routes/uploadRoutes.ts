import { Router } from 'express';
import { upload } from '../middleware/upload';
import { requireAuth } from '../middleware/auth';
import { uploadCertificate, uploadMaterial, uploadResume } from '../controllers/uploadController';

const router = Router();

router.post('/teachers/resume', requireAuth(['teacher']), upload.single('file'), uploadResume);
router.post('/teachers/certificates', requireAuth(['teacher']), upload.single('file'), uploadCertificate);
router.post('/materials', requireAuth(['teacher', 'institution']), upload.single('file'), uploadMaterial);

export default router;
