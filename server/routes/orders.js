const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

// @route   POST /api/orders
// @desc    Create a new order from cart
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { deliveryDate, deliveryAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate delivery date
    if (new Date(deliveryDate) < new Date()) {
      return res.status(400).json({ message: 'Delivery date must be in the future' });
    }

    // Build order items
    let totalMonthlyRent = 0;
    let totalSecurityDeposit = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product.available || product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is no longer available in the requested quantity`
        });
      }

      const itemRent = product.monthlyRent * item.quantity;
      const itemDeposit = product.securityDeposit * item.quantity;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        tenure: item.tenure,
        monthlyRent: product.monthlyRent,
        securityDeposit: product.securityDeposit
      });

      totalMonthlyRent += itemRent;
      totalSecurityDeposit += itemDeposit;

      // Update stock
      product.stock -= item.quantity;
      product.totalRentals += item.quantity;
      if (product.stock === 0) product.available = false;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalMonthlyRent,
      totalSecurityDeposit,
      deliveryDate,
      deliveryAddress,
      paymentStatus: 'paid'
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate and return
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('user', 'name email');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get current user's orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (admin)
router.put('/:id/status', authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    // If returned, restore stock
    if (status === 'returned') {
      order.returnDate = new Date();
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          product.available = true;
          await product.save();
        }
      }
    }

    // If cancelled, restore stock and refund
    if (status === 'cancelled') {
      order.paymentStatus = 'refunded';
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          product.available = true;
          await product.save();
        }
      }
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('user', 'name email');

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (admin)
// @access  Private (admin)
router.get('/admin/all', authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.product')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
