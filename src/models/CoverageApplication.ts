import mongoose, { Document, Schema } from 'mongoose';

export interface ICoverageApplication extends Document {
  userId: string;
  patientName: string;
  patientEmail: string;
  policyId: string;
  provider: string;
  coverageType: string;
  applicationDate: Date;
  status: 'Pending' | 'Approved' | 'Declined';
  adminNotes?: string;
  approvedBy?: string;
  approvedDate?: Date;
}

const CoverageApplicationSchema = new Schema<ICoverageApplication>({
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

export default mongoose.model<ICoverageApplication>('CoverageApplication', CoverageApplicationSchema);
