import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    category: { type: String, default: 'General', trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
