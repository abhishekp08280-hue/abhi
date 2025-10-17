const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const StudyMaterial = require('../models/StudyMaterial');
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
    cb(null, 'material-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, and TXT files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// Get all study materials
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      classGrade,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { isPublic: true };

    // Apply filters
    if (subject) {
      filter.subject = new RegExp(subject, 'i');
    }

    if (classGrade) {
      filter.classGrade = new RegExp(classGrade, 'i');
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const materials = await StudyMaterial.find(filter)
      .populate('uploaderId', 'email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudyMaterial.countDocuments(filter);

    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get study materials'
    });
  }
});

// Get single material
router.get('/:id', async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id)
      .populate('uploaderId', 'email role');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Increment download count
    material.downloadCount += 1;
    await material.save();

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get study material'
    });
  }
});

// Upload study material
router.post('/', [
  auth,
  upload.single('file'),
  body('title').notEmpty().trim(),
  body('subject').notEmpty().trim(),
  body('classGrade').notEmpty().trim(),
  body('description').optional().trim(),
  body('category').isIn(['notes', 'question-paper', 'syllabus', 'reference', 'other']),
  body('tags').optional().isArray()
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    const materialData = {
      uploaderId: req.user._id,
      title: req.body.title,
      subject: req.body.subject,
      classGrade: req.body.classGrade,
      description: req.body.description,
      category: req.body.category,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.filename,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      tags: req.body.tags || []
    };

    const material = new StudyMaterial(materialData);
    await material.save();

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      data: material
    });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload study material'
    });
  }
});

// Update study material
router.put('/:id', [
  auth,
  body('title').optional().trim(),
  body('subject').optional().trim(),
  body('classGrade').optional().trim(),
  body('description').optional().trim(),
  body('category').optional().isIn(['notes', 'question-paper', 'syllabus', 'reference', 'other']),
  body('isPublic').optional().isBoolean(),
  body('tags').optional().isArray()
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

    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      uploaderId: req.user._id
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found or access denied'
      });
    }

    Object.assign(material, req.body);
    await material.save();

    res.json({
      success: true,
      message: 'Study material updated successfully',
      data: material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update study material'
    });
  }
});

// Delete study material
router.delete('/:id', auth, async (req, res) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      uploaderId: req.user._id
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found or access denied'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', material.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await StudyMaterial.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Study material deleted successfully'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete study material'
    });
  }
});

// Get user's materials
router.get('/my/materials', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const materials = await StudyMaterial.find({ uploaderId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudyMaterial.countDocuments({ uploaderId: req.user._id });

    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get user materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your materials'
    });
  }
});

// Rate material
router.post('/:id/rate', [
  auth,
  body('rating').isFloat({ min: 1, max: 5 })
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

    const { rating } = req.body;
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Update rating
    const newAverage = ((material.rating.average * material.rating.count) + rating) / (material.rating.count + 1);
    
    material.rating.average = newAverage;
    material.rating.count += 1;
    
    await material.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        average: material.rating.average,
        count: material.rating.count
      }
    });
  } catch (error) {
    console.error('Rate material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate material'
    });
  }
});

module.exports = router;