const mongoose = require('mongoose');

const rolePurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['developer', 'security'],
      required: true,
    },
    priceCents: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    cardLast4: {
      type: String,
      maxlength: 4,
    },
    status: {
      type: String,
      enum: ['completed', 'failed'],
      default: 'completed',
    },
    paymentProvider: {
      type: String,
      default: 'mock',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RolePurchase', rolePurchaseSchema);
