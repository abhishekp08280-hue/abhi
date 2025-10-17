const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  resumeUrl: {
    type: String
  },
  resumeFileName: {
    type: String
  },
  certificates: [{
    title: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  experience: {
    type: String,
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance'],
    default: 'full-time'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);