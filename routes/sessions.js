const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Generate Jitsi meeting link
const generateJitsiLink = (meetingId) => {
  const baseUrl = process.env.JITSI_BASE_URL || 'https://meet.jit.si';
  return `${baseUrl}/${meetingId}`;
};

// Get all sessions
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      classGrade,
      status,
      search,
      sortBy = 'startTime',
      sortOrder = 'asc'
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

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const sessions = await Session.find(filter)
      .populate('hostId', 'email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions'
    });
  }
});

// Get single session
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('hostId', 'email role');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session'
    });
  }
});

// Create session
router.post('/', [
  auth,
  body('title').notEmpty().trim(),
  body('subject').notEmpty().trim(),
  body('classGrade').notEmpty().trim(),
  body('startTime').isISO8601(),
  body('duration').isInt({ min: 15, max: 480 }), // 15 minutes to 8 hours
  body('description').optional().trim(),
  body('isPublic').optional().isBoolean(),
  body('maxParticipants').optional().isInt({ min: 2, max: 100 })
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

    const {
      title,
      subject,
      classGrade,
      startTime,
      duration,
      description,
      isPublic = true,
      maxParticipants = 50
    } = req.body;

    // Check if start time is in the future
    const sessionStartTime = new Date(startTime);
    if (sessionStartTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in the future'
      });
    }

    // Generate unique meeting ID
    const meetingId = uuidv4().replace(/-/g, '').substring(0, 12);
    const meetingLink = generateJitsiLink(meetingId);

    const sessionData = {
      hostId: req.user._id,
      title,
      subject,
      classGrade,
      startTime: sessionStartTime,
      duration,
      description,
      meetingLink,
      meetingId,
      isPublic,
      maxParticipants
    };

    const session = new Session(sessionData);
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session'
    });
  }
});

// Update session
router.put('/:id', [
  auth,
  body('title').optional().trim(),
  body('subject').optional().trim(),
  body('classGrade').optional().trim(),
  body('startTime').optional().isISO8601(),
  body('duration').optional().isInt({ min: 15, max: 480 }),
  body('description').optional().trim(),
  body('isPublic').optional().isBoolean(),
  body('maxParticipants').optional().isInt({ min: 2, max: 100 }),
  body('status').optional().isIn(['scheduled', 'ongoing', 'completed', 'cancelled'])
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

    const session = await Session.findOne({
      _id: req.params.id,
      hostId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or access denied'
      });
    }

    // Don't allow updating completed or cancelled sessions
    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled sessions'
      });
    }

    Object.assign(session, req.body);
    await session.save();

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session'
    });
  }
});

// Delete session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      hostId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or access denied'
      });
    }

    // Don't allow deleting ongoing sessions
    if (session.status === 'ongoing') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete ongoing sessions'
      });
    }

    await Session.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session'
    });
  }
});

// Join session
router.post('/:id/join', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if session is accessible
    if (!session.isPublic && session.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This is a private session'
      });
    }

    // Check if session has started or is ongoing
    const now = new Date();
    if (session.startTime > now && session.status === 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Session has not started yet'
      });
    }

    // Check if session is full
    if (session.currentParticipants >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Session is full'
      });
    }

    // Add participant if not already joined
    const existingParticipant = session.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!existingParticipant) {
      session.participants.push({
        userId: req.user._id,
        joinedAt: new Date()
      });
      session.currentParticipants += 1;
      await session.save();
    }

    res.json({
      success: true,
      message: 'Joined session successfully',
      data: {
        meetingLink: session.meetingLink,
        meetingId: session.meetingId,
        session: {
          id: session._id,
          title: session.title,
          startTime: session.startTime,
          duration: session.duration
        }
      }
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join session'
    });
  }
});

// Leave session
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Remove participant
    const participantIndex = session.participants.findIndex(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (participantIndex !== -1) {
      session.participants[participantIndex].leftAt = new Date();
      session.currentParticipants = Math.max(0, session.currentParticipants - 1);
      await session.save();
    }

    res.json({
      success: true,
      message: 'Left session successfully'
    });
  } catch (error) {
    console.error('Leave session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave session'
    });
  }
});

// Get user's sessions
router.get('/my/sessions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { hostId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const sessions = await Session.find(filter)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your sessions'
    });
  }
});

// Start session (host only)
router.post('/:id/start', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      hostId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or access denied'
      });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Session is not in scheduled status'
      });
    }

    session.status = 'ongoing';
    await session.save();

    res.json({
      success: true,
      message: 'Session started successfully',
      data: session
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session'
    });
  }
});

// End session (host only)
router.post('/:id/end', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      hostId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or access denied'
      });
    }

    if (session.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        message: 'Session is not ongoing'
      });
    }

    session.status = 'completed';
    await session.save();

    res.json({
      success: true,
      message: 'Session ended successfully',
      data: session
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session'
    });
  }
});

module.exports = router;