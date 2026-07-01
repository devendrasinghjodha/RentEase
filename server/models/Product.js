const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: ['furniture', 'appliance']
  },
  subcategory: {
    type: String,
    required: [true, 'Please provide subcategory'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: 1000
  },
  image: {
    type: String,
    default: '/images/default-product.jpg'
  },
  monthlyRent: {
    type: Number,
    required: [true, 'Please provide monthly rent'],
    min: 0
  },
  securityDeposit: {
    type: Number,
    required: [true, 'Please provide security deposit'],
    min: 0
  },
  tenureOptions: [{
    months: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    }
  }],
  specifications: {
    type: Map,
    of: String
  },
  available: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 10,
    min: 0
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair'],
    default: 'new'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  totalRentals: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ monthlyRent: 1 });

module.exports = mongoose.model('Product', productSchema);
