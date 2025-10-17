import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    createdTimestamp: Date;
}

const DoctorSchema = new Schema<IDoctor>({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    }, 
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    createdTimestamp: {
        type: Date,
        default: Date.now  // ✅ FIXED: Changed from Date.now() to Date.now
    }
});

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
