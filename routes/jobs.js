const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const InstitutionProfile = require('../models/InstitutionProfile');
const TeacherProfile = require('../models/TeacherProfile');
const auth = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      jobType,
      subject,
      minSalary,
      maxSalary,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { status: 'active' };

    // Apply filters
    if (city) {
      filter.city = new RegExp(city, 'i');
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (subject) {
      filter.subjects = { $in: [new RegExp(subject, 'i')] };
    }

    if (minSalary || maxSalary) {
      filter['salary.min'] = {};
      if (minSalary) filter['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) filter['salary.max'].$lte = parseInt(maxSalary);
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

    const jobs = await Job.find(filter)
      .populate('employerId', 'orgName contactPerson city type')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get jobs'
    });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'orgName contactPerson city type description website');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job'
    });
  }
});

// Create job (institution only)
router.post('/', [
  auth,
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('requirements').notEmpty().trim(),
  body('qualifications').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('salary.min').isNumeric(),
  body('salary.max').isNumeric(),
  body('jobType').isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  body('subjects').isArray(),
  body('classes').isArray()
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

    if (req.user.role !== 'institution') {
      return res.status(403).json({
        success: false,
        message: 'Only institutions can create jobs'
      });
    }

    const jobData = {
      ...req.body,
      employerId: req.user._id
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
});

// Update job (institution only)
router.put('/:id', [
  auth,
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('requirements').optional().trim(),
  body('qualifications').optional().trim(),
  body('city').optional().trim(),
  body('salary.min').optional().isNumeric(),
  body('salary.max').optional().isNumeric(),
  body('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  body('status').optional().isIn(['active', 'paused', 'closed'])
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

    const job = await Job.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
});

// Delete job (institution only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Delete related applications
    await Application.deleteMany({ jobId: job._id });

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
});

// Apply for job (teacher only)
router.post('/:id/apply', [
  auth,
  body('coverLetter').optional().trim().isLength({ max: 1000 })
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

    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can apply for jobs'
      });
    }

    const jobId = req.params.id;
    const { coverLetter } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Job is not accepting applications'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      teacherId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Get teacher profile
    const teacherProfile = await TeacherProfile.findOne({ userId: req.user._id });
    if (!teacherProfile) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Create application
    const application = new Application({
      jobId,
      teacherId: teacherProfile._id,
      coverLetter
    });

    await application.save();

    // Update job application count
    job.applicationCount += 1;
    await job.save();

    // Send notification email to institution
    try {
      const institutionProfile = await InstitutionProfile.findOne({ userId: job.employerId });
      if (institutionProfile) {
        await emailService.sendJobApplicationNotification(
          req.user.email, // Institution email
          teacherProfile.name,
          job.title,
          application._id
        );
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply for job'
    });
  }
});

// Get job applications (institution only)
router.get('/:id/applications', auth, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    const applications = await Application.find({ jobId: req.params.id })
      .populate('teacherId', 'name phone city qualification experience subjects')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications'
    });
  }
});

// Search jobs by location
router.get('/search/location', async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query; // radius in km

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Simple city-based search for now
    // In production, you'd implement proper geospatial queries
    const jobs = await Job.find({ status: 'active' })
      .populate('employerId', 'orgName city')
      .limit(20);

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search jobs by location'
    });
  }
});

module.exports = router;