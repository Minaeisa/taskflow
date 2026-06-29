import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

export type MemberRole = 'owner' | 'admin' | 'member';

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
      },
    ],
    default: [],
  })
  members: Array<{ user: Types.ObjectId; role: MemberRole }>;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
