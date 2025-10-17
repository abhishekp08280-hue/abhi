const mongoose = require('mongoose');

const institutionProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  orgName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
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
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  website: {
    type: String,
    trim: true
  },
  establishedYear: {
    type: Number
  },
  employeeCount: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+']
  },
  type: {
    type: String,
    enum: ['school', 'college', 'university', 'coaching', 'online', 'other'],
    default: 'school'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InstitutionProfile', institutionProfileSchema);