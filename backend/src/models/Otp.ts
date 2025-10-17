import mongoose, { Schema, Document, Types } from 'mongoose';

export type OtpPurpose = 'register' | 'login' | 'reset';

export interface IOtp extends Document {
  userId: Types.ObjectId;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  otpHash: { type: String, required: true },
  purpose: { type: String, enum: ['register', 'login', 'reset'], required: true },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

OtpSchema.index({ userId: 1, purpose: 1, used: 1, expiresAt: 1 });

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
