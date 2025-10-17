const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  uploaderId: {
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
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  category: {
    type: String,
    enum: ['notes', 'question-paper', 'syllabus', 'reference', 'other'],
    default: 'notes'
  }
}, {
  timestamps: true
});

// Index for search functionality
studyMaterialSchema.index({ title: 'text', description: 'text', tags: 'text' });
studyMaterialSchema.index({ subject: 1, classGrade: 1 });
studyMaterialSchema.index({ uploaderId: 1 });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);