const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// All cart routes require authentication
router.use(protect);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1, tenure = 3 } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.available || product.stock < quantity) {
      return res.status(400).json({ message: 'Product is not available in requested quantity' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity, tenure }]
      });
    } else {
      // Check if item already in cart
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.tenure = tenure;
      } else {
        cart.items.push({ product: productId, quantity, tenure });
      }

      await cart.save();
    }

    // Populate and return
    cart = await Cart.findById(cart._id).populate('items.product');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item (quantity/tenure)
// @access  Private
router.put('/:itemId', async (req, res) => {
  try {
    const { quantity, tenure } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (tenure !== undefined) item.tenure = tenure;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
