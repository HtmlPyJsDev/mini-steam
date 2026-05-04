const mongoose = require('mongoose');

const devUpdateSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      default: null,
      index: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    imageKey: {
      type: String,
      default: '',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

devUpdateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DevUpdate', devUpdateSchema);
