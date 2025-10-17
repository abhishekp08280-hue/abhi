import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISession extends Document {
  hostId: Types.ObjectId; // User (teacher or institution)
  title: string;
  description?: string;
  startTime: Date;
  duration: number; // minutes
  meetingLink: string;
  provider: 'Jitsi';
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  meetingLink: { type: String, required: true },
  provider: { type: String, enum: ['Jitsi'], default: 'Jitsi' },
  createdAt: { type: Date, default: Date.now },
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);
