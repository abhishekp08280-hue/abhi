const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherProfile',
    required: true
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  interviewScheduled: {
    type: Date
  },
  interviewLink: {
    type: String
  },
  salaryOffered: {
    type: Number
  },
  offerLetter: {
    type: String
  }
}, {
  timestamps: true
});

// Ensure one application per teacher per job
applicationSchema.index({ jobId: 1, teacherId: 1 }, { unique: true });

// Index for queries
applicationSchema.index({ teacherId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);