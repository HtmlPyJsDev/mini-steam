const mongoose = require('mongoose');

const uzisLedgerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    delta: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'presence',
        'review',
        'admin_grant',
        'admin_deduct',
        'shop_role_developer',
        'shop_role_security',
        'contest_prize',
        'contest_refund',
        'review_revoked',
        'welcome_bonus',
        'game_purchase',
      ],
    },
    note: {
      type: String,
      default: '',
      maxlength: 200,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

uzisLedgerSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UzisLedger', uzisLedgerSchema);
