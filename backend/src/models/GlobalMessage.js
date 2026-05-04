const mongoose = require('mongoose');

const globalMessageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

globalMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GlobalMessage', globalMessageSchema);
