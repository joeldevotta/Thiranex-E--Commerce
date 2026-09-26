import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';

const products = [
  { name: 'Wireless Headphones', description: 'Comfortable over-ear headphones with everyday battery life.', price: 2999, stock: 18, category: 'Audio' },
  { name: 'Mechanical Keyboard', description: 'Compact mechanical keyboard for work and gaming.', price: 3499, stock: 12, category: 'Accessories' },
  { name: 'Smart Watch', description: 'Minimal smartwatch with fitness and notification features.', price: 4999, stock: 9, category: 'Wearables' },
  { name: 'USB-C Hub', description: '7-in-1 hub with HDMI, USB and SD card connectivity.', price: 1799, stock: 25, category: 'Accessories' },
  { name: 'Portable SSD 1TB', description: 'Fast portable storage for laptops and consoles.', price: 6499, stock: 8, category: 'Storage' },
  { name: 'Desk Lamp', description: 'Adjustable LED desk lamp for study and work setups.', price: 1299, stock: 20, category: 'Lifestyle' }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL || 'admin@thiranex.local';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const hash = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate({ email }, { name: 'Thiranex Admin', email, password: hash, role: 'admin' }, { upsert: true, new: true });
  if (!(await Product.countDocuments())) await Product.insertMany(products);
  console.log(`Admin ready: ${email}`);
  console.log('Set ADMIN_PASSWORD in .env before using this outside local development.');
  await mongoose.disconnect();
}

seed().catch(error => { console.error(error); process.exit(1); });
