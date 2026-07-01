const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// All maintenance routes require authentication
router.use(protect);

// @route   POST /api/maintenance
// @desc    Create a maintenance request
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { orderId, productId, issueType, description, priority } = req.body;

    // Verify order belongs to user
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find product name
    const orderItem = order.items.find(
      item => item.product._id.toString() === productId
    );

    const maintenance = await Maintenance.create({
      user: req.user._id,
      order: orderId,
      product: productId,
      productName: orderItem ? orderItem.productName : 'Unknown Product',
      issueType,
      description,
      priority: priority || 'medium'
    });

    res.status(201).json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/maintenance
// @desc    Get user's maintenance requests
// @access  Private
router.get('/', async (req, res) => {
  try {
    const requests = await Maintenance.find({ user: req.user._id })
      .populate('product', 'name image')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/maintenance/admin/all
// @desc    Get all maintenance requests (admin)
// @access  Private (admin)
router.get('/admin/all', authorize('admin'), async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const requests = await Maintenance.find(query)
      .populate('user', 'name email phone')
      .populate('product', 'name image')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/maintenance/:id
// @desc    Update maintenance request status (admin)
// @access  Private (admin)
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const request = await Maintenance.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    if (status) request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    if (status === 'resolved') request.resolvedAt = new Date();

    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
