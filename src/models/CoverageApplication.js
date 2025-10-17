const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============================================
// COVERAGE APPLICATION MODEL
// ============================================

const CoverageApplicationSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  policyId: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  coverageType: {
    type: String,
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined'],
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: String,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Create and export the model
const CoverageApplication = mongoose.model('CoverageApplication', CoverageApplicationSchema);

module.exports = CoverageApplication;
