import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    userName: string;
    password: string;
    entityId?: mongoose.Schema.Types.ObjectId;
    role: 'Patient' | 'Doctor' | 'Admin';
    createdTimestamp: Date;
}

const userSchema = new Schema<IUser>({
    userName: {  // Keep as userName (camelCase)
        type: String,
        required: true,
        unique: true   
    },
    password: {
        type: String,
        required: true
    },
    entityId: {
        type: Schema.Types.ObjectId,
        refPath: 'role',
        required: false
    },
    role: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor', 'Admin'],   
    },
    createdTimestamp: {
        type: Date,
        default: Date.now  // ✅ FIXED: Changed from Date.now() to Date.now
    }
});

export default mongoose.model<IUser>('User', userSchema);
