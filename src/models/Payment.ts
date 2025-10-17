import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  transactionId: string;
  userId: string;
  amount: number;
  method: 'Coverage' | 'CreditCard' | 'Cash';
  status: 'Processed' | 'PendingVerification' | 'Failed' | 'CoverageRejected';
  date: Date;
  details: {
    lastFourDigits?: string;
    policyId?: string;
    serviceReference?: string;
    depositSlipUrl?: string;
    depositReference?: string;
    expiryDate?: string;
    cardType?: string;
  };
}

const PaymentSchema = new Schema<IPayment>({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    default: 55.00
  },
  method: {
    type: String,
    required: true,
    enum: ['Coverage', 'CreditCard', 'Cash']
  },
  status: {
    type: String,
    required: true,
    enum: ['Processed', 'PendingVerification', 'Failed', 'CoverageRejected'],
    default: 'PendingVerification'
  },
  date: {
    type: Date,
    default: Date.now
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
PaymentSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
