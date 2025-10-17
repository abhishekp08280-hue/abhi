const mongoose = require('mongoose');
const crypto = require('crypto');

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['register', 'login', 'reset'],
    default: 'register'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  used: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP
otpSchema.statics.createOTP = async function(userId, email, purpose = 'register') {
  // Delete any existing OTPs for this user
  await this.deleteMany({ userId, purpose });
  
  const otp = this.generateOTP();
  return await this.create({
    userId,
    email,
    otp,
    purpose
  });
};

// Method to verify OTP
otpSchema.methods.verifyOTP = function(inputOTP) {
  if (this.used) {
    throw new Error('OTP has already been used');
  }
  
  if (new Date() > this.expiresAt) {
    throw new Error('OTP has expired');
  }
  
  if (this.attempts >= 3) {
    throw new Error('Too many OTP attempts');
  }
  
  if (this.otp !== inputOTP) {
    this.attempts += 1;
    this.save();
    throw new Error('Invalid OTP');
  }
  
  this.used = true;
  this.save();
  return true;
};

module.exports = mongoose.model('OTP', otpSchema);