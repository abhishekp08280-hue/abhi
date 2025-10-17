const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const TeacherProfile = require('../models/TeacherProfile');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, PNG, and JPG files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Get teacher profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher profile'
    });
  }
});

// Update teacher profile
router.put('/me', [
  auth,
  body('name').optional().trim(),
  body('phone').optional().trim(),
  body('city').optional().trim(),
  body('address').optional().trim(),
  body('qualification').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('experience').optional().trim(),
  body('subjects').optional().isArray(),
  body('availability').optional().isIn(['full-time', 'part-time', 'contract', 'freelance'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = req.body;
    
    const profile = await TeacherProfile.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Upload resume
router.post('/resume', [auth, upload.single('resume')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    const profile = await TeacherProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Delete old resume if exists
    if (profile.resumeUrl) {
      const oldFilePath = path.join(process.env.UPLOAD_PATH || './uploads', profile.resumeFileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update profile with new resume
    profile.resumeUrl = `/uploads/${req.file.filename}`;
    profile.resumeFileName = req.file.filename;
    await profile.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: profile.resumeUrl,
        fileName: profile.resumeFileName
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume'
    });
  }
});

// Upload certificate
router.post('/certificates', [auth, upload.single('certificate')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Certificate file is required'
      });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Certificate title is required'
      });
    }

    const profile = await TeacherProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Add certificate to profile
    profile.certificates.push({
      title,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.filename
    });

    await profile.save();

    res.json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        certificate: profile.certificates[profile.certificates.length - 1]
      }
    });
  } catch (error) {
    console.error('Upload certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate'
    });
  }
});

// Get certificates
router.get('/certificates', auth, async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.json({
      success: true,
      data: profile.certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get certificates'
    });
  }
});

// Delete certificate
router.delete('/certificates/:certId', auth, async (req, res) => {
  try {
    const { certId } = req.params;
    
    const profile = await TeacherProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    const certificate = profile.certificates.id(certId);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', certificate.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove certificate from profile
    profile.certificates.pull(certId);
    await profile.save();

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate'
    });
  }
});

// Get teacher applications
router.get('/applications', auth, async (req, res) => {
  try {
    const Application = require('../models/Application');
    const Job = require('../models/Job');
    const InstitutionProfile = require('../models/InstitutionProfile');

    const applications = await Application.find({ teacherId: req.user._id })
      .populate('jobId', 'title employerId city salary status')
      .sort({ appliedAt: -1 });

    // Get institution details for each application
    const applicationsWithInstitution = await Promise.all(
      applications.map(async (app) => {
        const institution = await InstitutionProfile.findOne({ userId: app.jobId.employerId });
        return {
          ...app.toObject(),
          institution: institution ? {
            orgName: institution.orgName,
            contactPerson: institution.contactPerson
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: applicationsWithInstitution
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications'
    });
  }
});

module.exports = router;