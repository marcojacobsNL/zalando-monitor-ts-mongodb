import { Schema, model, Document } from 'mongoose'

/**
 * Interface for defining Store
 */
export interface IStore extends Document {
  name: string
  url: string
  region: string | null
  type: string | null
  appDomain: number | null
  products: string[]
  active: boolean
  createdDate: Date
}

/**
 * Schema to handle keys
 */
const storeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: false
  },
  region: {
    type: String,
    required: false
  },
  products: {
    type: Array,
    required: false
  },
  appDomain: {
    type: Number,
    required: false
  },
  active: {
    type: Boolean,
    required: false
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
})

export const Store = model<IStore>('Store', storeSchema)
