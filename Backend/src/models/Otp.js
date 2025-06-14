 const mongoose = require('../config/connect');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300  // TTL: 5 minutes
  }
});

module.exports = mongoose.models.Otp || mongoose.model('Otp', otpSchema);

