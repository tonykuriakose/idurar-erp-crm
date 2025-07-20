import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ default: false })
  removed: boolean;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  email: string;

  @Prop()
  company: string;

  @Prop()
  website: string;

  @Prop()
  country: string;

  @Prop()
  city: string;

  @Prop()
  postalCode: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);