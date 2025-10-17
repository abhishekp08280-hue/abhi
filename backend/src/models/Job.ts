import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJob extends Document {
  employerId: Types.ObjectId; // User (institution)
  title: string;
  description: string;
  qualifications?: string;
  city?: string;
  salary?: string;
  tags: string[];
  createdAt: Date;
}

const JobSchema = new Schema<IJob>({
  employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  qualifications: { type: String },
  city: { type: String },
  salary: { type: String },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

JobSchema.index({ title: 'text', description: 'text', qualifications: 'text', tags: 'text', city: 'text' });

export const Job = mongoose.model<IJob>('Job', JobSchema);
