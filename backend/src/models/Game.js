const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    coverUrl: {
      type: String,
      required: [true, 'Cover image URL is required'],
    },
    screenshots: {
      type: [String],
      default: [],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileKey: {
      type: String,
      required: [true, 'File key is required'],
    },
    license: {
      type: String,
      required: [true, 'License is required (only legally free/open-source games are allowed)'],
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
