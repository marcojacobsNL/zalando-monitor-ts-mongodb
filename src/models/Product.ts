import { Schema, model, Document } from 'mongoose';
import { IProductOption } from './ProductOption';

/**
 * Interface for defining UserSensor
 */
export interface IProduct extends Document {
  name: string;
  sku: string;
  storeId: string;
  image: string;
  url: string;
  price: string;
  productOptions: IProductOption[];
  updatedDate: Date;
  createdDate: Date;
}

/**
 * Schema to handle keys
 */
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  storeId: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  price: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  productOptions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ProductOption',
    },
  ],
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export const Product = model<IProduct>('Product', productSchema);
