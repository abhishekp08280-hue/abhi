const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  classGrade: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  endTime: {
    type: Date
  },
  meetingLink: {
    type: String,
    required: true
  },
  meetingId: {
    type: String,
    required: true,
    unique: true
  },
  provider: {
    type: String,
    enum: ['jitsi', 'zoom', 'google-meet'],
    default: 'jitsi'
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  maxParticipants: {
    type: Number,
    default: 50
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date
    },
    leftAt: {
      type: Date
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  password: {
    type: String
  },
  recordingUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for queries
sessionSchema.index({ hostId: 1, status: 1 });
sessionSchema.index({ startTime: 1, status: 1 });
sessionSchema.index({ subject: 1, classGrade: 1 });

// Calculate end time before saving
sessionSchema.pre('save', function(next) {
  if (this.startTime && this.duration) {
    this.endTime = new Date(this.startTime.getTime() + this.duration * 60000);
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema);