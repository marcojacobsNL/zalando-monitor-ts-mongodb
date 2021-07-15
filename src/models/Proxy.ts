import { Schema, model, Document } from 'mongoose';

/**
 * Interface for defining UserSensor
 */
export interface IProxy extends Document {
  proxy: string;
  type: string;
}

/**
 * Schema to handle keys
 */
const proxySchema = new Schema({
  proxy: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

export const Proxy = model<IProxy>('Proxy', proxySchema);
