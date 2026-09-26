import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'Thiranex E-Commerce API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

async function start() {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not configured. API will start, but database features will not work.');
  } else {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  }

  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
