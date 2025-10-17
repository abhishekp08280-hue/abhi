const express = require('express');
const { body, validationResult } = require('express-validator');
const InstitutionProfile = require('../models/InstitutionProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const TeacherProfile = require('../models/TeacherProfile');
const auth = require('../middleware/auth');

const router = express.Router();

// Get institution profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await InstitutionProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institution profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get institution profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get institution profile'
    });
  }
});

// Update institution profile
router.put('/me', [
  auth,
  body('orgName').optional().trim(),
  body('contactPerson').optional().trim(),
  body('phone').optional().trim(),
  body('city').optional().trim(),
  body('address').optional().trim(),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('website').optional().trim(),
  body('establishedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
  body('employeeCount').optional().isIn(['1-10', '11-50', '51-200', '201-500', '500+']),
  body('type').optional().isIn(['school', 'college', 'university', 'coaching', 'online', 'other'])
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
    
    const profile = await InstitutionProfile.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institution profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update institution profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get institution's jobs
router.get('/jobs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { employerId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
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
    console.error('Get institution jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get jobs'
    });
  }
});

// Get job applications
router.get('/jobs/:jobId/applications', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Verify job belongs to this institution
    const job = await Job.findOne({ _id: jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    const filter = { jobId };
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('teacherId', 'name phone city qualification experience subjects')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        job: {
          id: job._id,
          title: job.title,
          status: job.status
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications'
    });
  }
});

// Update application status
router.put('/applications/:applicationId/status', [
  auth,
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']),
  body('notes').optional().trim()
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

    const { applicationId } = req.params;
    const { status, notes } = req.body;

    // Find application and verify job belongs to this institution
    const application = await Application.findById(applicationId)
      .populate('jobId', 'employerId title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update application
    application.status = status;
    application.reviewedAt = new Date();
    if (notes) {
      application.notes = notes;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ employerId: req.user._id });
    const activeJobs = await Job.countDocuments({ employerId: req.user._id, status: 'active' });
    
    const totalApplications = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $match: {
          'job.employerId': req.user._id
        }
      },
      {
        $count: 'total'
      }
    ]);

    const recentApplications = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $match: {
          'job.employerId': req.user._id,
          appliedAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      },
      {
        $count: 'total'
      }
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications: totalApplications[0]?.total || 0,
        recentApplications: recentApplications[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats'
    });
  }
});

module.exports = router;