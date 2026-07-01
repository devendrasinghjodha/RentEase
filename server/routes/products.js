const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, search, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    let query = { available: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Subcategory filter
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.monthlyRent = {};
      if (minPrice) query.monthlyRent.$gte = Number(minPrice);
      if (maxPrice) query.monthlyRent.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort
    let sortOption = {};
    switch (sort) {
      case 'price-low':
        sortOption = { monthlyRent: 1 };
        break;
      case 'price-high':
        sortOption = { monthlyRent: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { totalRentals: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private (admin/vendor)
router.post('/', protect, authorize('admin', 'vendor'), async (req, res) => {
  try {
    req.body.vendor = req.user._id;
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (admin/vendor)
router.put('/:id', protect, authorize('admin', 'vendor'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
