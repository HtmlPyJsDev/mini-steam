const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

groupMessageSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.model('GroupMessage', groupMessageSchema);
