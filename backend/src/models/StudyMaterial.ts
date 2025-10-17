import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudyMaterial extends Document {
  uploaderId: Types.ObjectId; // User
  title: string;
  subject: string;
  classGrade: string;
  fileUrl?: string;
  linkUrl?: string;
  createdAt: Date;
}

const StudyMaterialSchema = new Schema<IStudyMaterial>({
  uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  classGrade: { type: String, required: true },
  fileUrl: { type: String },
  linkUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

StudyMaterialSchema.index({ title: 'text', subject: 'text', classGrade: 'text' });

export const StudyMaterial = mongoose.model<IStudyMaterial>('StudyMaterial', StudyMaterialSchema);
