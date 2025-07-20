import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class InvoiceItem {
  @Prop({ required: true })
  itemName: string;

  @Prop()
  description: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: '' })
  notes: string;
}

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop({ default: false })
  removed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  year: number;

  @Prop()
  content: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  expiredDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId;

  @Prop([InvoiceItem])
  items: InvoiceItem[];

  @Prop({ default: 0 })
  taxRate: number;

  @Prop({ default: 0 })
  subTotal: number;

  @Prop({ default: 0 })
  taxTotal: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 'USD', uppercase: true })
  currency: string;

  @Prop({ default: 0 })
  credit: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 'unpaid', enum: ['unpaid', 'paid', 'partially'] })
  paymentStatus: string;

  @Prop({ default: false })
  isOverdue: boolean;

  @Prop({ default: false })
  approved: boolean;

  @Prop()
  notes: string;

  @Prop({ default: '' })
  notesSummary: string;

  @Prop({ default: 'draft', enum: ['draft', 'pending', 'sent', 'refunded', 'cancelled', 'on hold'] })
  status: string;

  @Prop()
  pdf: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);