import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInstitutionProfile extends Document {
  userId: Types.ObjectId;
  org_name?: string;
  contact_person?: string;
  city?: string;
  contact_info?: string;
  description?: string;
}

const InstitutionProfileSchema = new Schema<IInstitutionProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  org_name: { type: String },
  contact_person: { type: String },
  city: { type: String },
  contact_info: { type: String },
  description: { type: String },
});

export const InstitutionProfile = mongoose.model<IInstitutionProfile>('InstitutionProfile', InstitutionProfileSchema);
