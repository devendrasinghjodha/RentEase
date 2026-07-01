const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    tenure: {
      type: Number,
      required: true
    },
    monthlyRent: {
      type: Number,
      required: true
    },
    securityDeposit: {
      type: Number,
      required: true
    }
  }],
  totalMonthlyRent: {
    type: Number,
    required: true
  },
  totalSecurityDeposit: {
    type: Number,
    required: true
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Please provide delivery date']
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'out-for-delivery', 'delivered', 'active', 'return-scheduled', 'returned', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  returnDate: Date,
  notes: String
}, {
  timestamps: true
});

orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
