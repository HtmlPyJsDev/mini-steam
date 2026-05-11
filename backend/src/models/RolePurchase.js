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
    status: {
      type: String,
      enum: ['requested', 'granted', 'rejected'],
      default: 'requested',
      index: true,
    },
    paymentProvider: {
      type: String,
      default: 'telegram',
    },
    contactHandle: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      maxlength: 500,
      default: '',
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    grantedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RolePurchase', rolePurchaseSchema);
