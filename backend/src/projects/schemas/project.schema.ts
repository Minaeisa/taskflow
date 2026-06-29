import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
];

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ default: '#6366f1' })
  color: string;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspace: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false })
  archived: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
