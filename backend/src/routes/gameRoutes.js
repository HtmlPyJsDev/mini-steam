const express = require('express');

const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { getDownloadUrl } = require('../utils/r2Upload');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const games = await Game.find({
      $or: [{ status: 'approved' }, { status: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .populate('uploaderId', 'email role displayName avatarUrl')
      .lean();
    return res.json({ games });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id)
      .populate('uploaderId', 'email role displayName avatarUrl')
      .lean();
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    if (game.status === 'pending' || game.status === 'rejected') {
      // Hide unapproved games from the public game detail.
      return res.status(404).json({ message: 'Game not found' });
    }
    return res.json({ game });
  })
);

const downloadHandler = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) {
    return res.status(404).json({ message: 'Game not found' });
  }
  if (game.status && game.status !== 'approved') {
    return res.status(404).json({ message: 'Game not found' });
  }

  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { downloads: game._id } }
  );

  const url = await getDownloadUrl(game.fileKey);
  return res.json({
    url,
    fileKey: game.fileKey,
    title: game.title,
    size: game.size,
    license: game.license,
  });
});

module.exports = router;
module.exports.downloadHandler = downloadHandler;
module.exports.auth = auth;
