import mongoose, { Schema, Document, Types } from 'mongoose';

export type ApplicationStatus = 'applied' | 'reviewed' | 'accepted' | 'rejected';

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  teacherId: Types.ObjectId; // User (teacher)
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String },
  status: { type: String, enum: ['applied', 'reviewed', 'accepted', 'rejected'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now },
});

ApplicationSchema.index({ jobId: 1, teacherId: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
