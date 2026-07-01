const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Maintenance = require('../models/Maintenance');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (admin)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeRentals = await Order.countDocuments({ status: { $in: ['active', 'delivered'] } });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const openMaintenance = await Maintenance.countDocuments({ status: { $in: ['open', 'in-progress'] } });

    // Calculate revenue
    const orders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalMonthlyRent, 0);
    const totalDeposits = orders.reduce((sum, order) => sum + order.totalSecurityDeposit, 0);

    // Monthly revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyOrders = await Order.find({
      paymentStatus: 'paid',
      createdAt: { $gte: startOfMonth }
    });
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalMonthlyRent, 0);

    // Product utilization
    const availableProducts = await Product.countDocuments({ available: true });
    const utilizationRate = totalProducts > 0 
      ? Math.round(((totalProducts - availableProducts) / totalProducts) * 100) 
      : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgRent: { $avg: '$monthlyRent' } } }
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      activeRentals,
      pendingOrders,
      openMaintenance,
      totalRevenue,
      totalDeposits,
      monthlyRevenue,
      utilizationRate,
      recentOrders,
      ordersByStatus,
      categoryDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/inventory
// @desc    Get inventory summary and low-stock products
// @access  Private (admin)
router.get('/inventory', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('vendor', 'name email')
      .sort({ updatedAt: -1 });

    const lowStockProducts = products.filter((product) => product.stock <= 3);
    const outOfStockProducts = products.filter((product) => product.stock === 0);

    res.json({
      totalProducts: products.length,
      availableProducts: products.filter((product) => product.available).length,
      lowStockProducts,
      outOfStockProducts,
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user role/status
// @access  Private (admin)
router.put('/users/:id', async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
