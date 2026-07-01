const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  issueType: {
    type: String,
    enum: ['repair', 'replacement', 'cleaning', 'installation', 'other'],
    required: [true, 'Please provide issue type']
  },
  description: {
    type: String,
    required: [true, 'Please describe the issue'],
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  adminNotes: String,
  resolvedAt: Date
}, {
  timestamps: true
});

maintenanceSchema.index({ user: 1, status: 1 });
maintenanceSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
