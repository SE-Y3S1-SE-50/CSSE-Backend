import mongoose, { Document, Schema } from 'mongoose';

export interface ICashPaymentReceipt extends Document {
  userId: mongoose.Types.ObjectId;
  patientName: string;
  patientId: string;
  patientEmail: string;
  patientPhone: string;
  amount: number;
  depositReference: string;
  bankName: string;
  branchName: string;
  depositDate: Date;
  transactionId: string;
  receiptNumber: string;
  notes?: string;
  paymentSlipUrl?: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Under Review';
  adminNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
}

const CashPaymentReceiptSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  patientId: { type: String, required: true },
  patientEmail: { type: String, required: true },
  patientPhone: { type: String, required: true },
  amount: { type: Number, required: true },
  depositReference: { type: String, required: true },
  bankName: { type: String, required: true },
  branchName: { type: String, required: true },
  depositDate: { type: Date, required: true },
  transactionId: { type: String, required: true },
  receiptNumber: { type: String, required: true, unique: true },
  notes: { type: String },
  paymentSlipUrl: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Declined', 'Under Review'], 
    default: 'Pending' 
  },
  adminNotes: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model<ICashPaymentReceipt>('CashPaymentReceipt', CashPaymentReceiptSchema);
