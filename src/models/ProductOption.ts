import { Schema, model, Document } from 'mongoose';
import { IProduct } from './Product';

/**
 * Interface for defining UserSensor
 */
export interface IProductOption extends Document {
  name: string;
  sku: string;
  storeId: string | null;
  product: Schema.Types.ObjectId;
  inStock: boolean;
  updatedDate: Date;
  createdDate: Date;
}

/**
 * Schema to handle keys
 */
const productOptionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  store: {
    type: String,
    default: null,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  inStock: {
    type: Boolean,
    default: false,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export const ProductOption = model<IProductOption>('ProductOption', productOptionSchema);
