import express from 'express';
import Order from '../models/Order.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { items, totalPrice } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Order must contain at least one item' });

    const order = await Order.create({ user: req.user._id, items, totalPrice });
    res.status(201).json(order);
  } catch (error) { next(error); }
});

router.get('/myorders', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { next(error); }
});

router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { next(error); }
});

router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status' });

    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) { next(error); }
});

export default router;
