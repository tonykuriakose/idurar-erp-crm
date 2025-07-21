import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  projectId: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  startDate: Date;
  endDate?: Date;
}

const ProjectSchema = new Schema<IProject>({
  projectId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Planning', 'In Progress', 'Completed', 'On Hold'], default: 'Planning' },
  startDate: { type: Date, required: true },
  endDate: { type: Date }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);