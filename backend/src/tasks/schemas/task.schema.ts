import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({
    type: String,
    enum: ['todo', 'in_progress', 'in_review', 'done'],
    default: 'todo',
  })
  status: TaskStatus;

  @Prop({
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: TaskPriority;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignee: Types.ObjectId;

  @Prop({ default: null })
  dueDate: Date;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
