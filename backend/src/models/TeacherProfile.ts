import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICertificate {
  title: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface ITeacherProfile extends Document {
  userId: Types.ObjectId;
  name?: string;
  phone?: string;
  city?: string;
  qualification?: string;
  resumeUrl?: string;
  certificates: ICertificate[];
}

const CertificateSchema = new Schema<ICertificate>({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const TeacherProfileSchema = new Schema<ITeacherProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String },
  phone: { type: String },
  city: { type: String },
  qualification: { type: String },
  resumeUrl: { type: String },
  certificates: { type: [CertificateSchema], default: [] },
});

export const TeacherProfile = mongoose.model<ITeacherProfile>('TeacherProfile', TeacherProfileSchema);
