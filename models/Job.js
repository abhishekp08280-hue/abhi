const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstitutionProfile',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  requirements: {
    type: String,
    required: true,
    trim: true
  },
  qualifications: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  salary: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    currency: {
      type: String,
      default: 'INR'
    },
    period: {
      type: String,
      enum: ['monthly', 'yearly', 'hourly'],
      default: 'monthly'
    }
  },
  experience: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number
    }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    default: 'full-time'
  },
  subjects: [{
    type: String,
    trim: true
  }],
  classes: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  applicationDeadline: {
    type: Date
  },
  startDate: {
    type: Date
  },
  benefits: [{
    type: String,
    trim: true
  }],
  location: {
    type: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid'],
      default: 'onsite'
    },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', description: 'text', tags: 'text' });
jobSchema.index({ city: 1, status: 1 });
jobSchema.index({ employerId: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);