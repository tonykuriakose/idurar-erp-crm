import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Document type for Query
export type QueryDocument = Query & Document;

// Embedded note schema
@Schema({ timestamps: true })
export class QueryNote {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  author: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

// Main Query schema with explicit export
@Schema({ timestamps: true })
export class Query extends Document {
  @Prop({ unique: true })
  queryNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Client' })
  customer: Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 'Open', enum: ['Open', 'InProgress', 'Closed'] })
  status: string;

  @Prop({ default: 'Medium', enum: ['Low', 'Medium', 'High', 'Critical'] })
  priority: string;

  @Prop({ default: '' })
  resolution: string;

  @Prop({ default: '' })
  assignedTo: string;

  @Prop([QueryNote])
  notes: QueryNote[];

  @Prop([String])
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: false })
  removed: boolean;
}

// Create schema
export const QuerySchema = SchemaFactory.createForClass(Query);