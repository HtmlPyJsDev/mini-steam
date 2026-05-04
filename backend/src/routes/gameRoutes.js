const express = require('express');

const mongoose = require('mongoose');

const Game = require('../models/Game');
const User = require('../models/User');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { getDownloadUrl } = require('../utils/r2Upload');

const router = express.Router();

async function attachRatingSummary(game) {
  const agg = await Review.aggregate([
    { $match: { gameId: new mongoose.Types.ObjectId(game._id) } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  const summary = agg[0] || { avg: 0, count: 0 };
  game.ratingAvg = Number(summary.avg?.toFixed(2)) || 0;
  game.ratingCount = summary.count;
  return game;
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const games = await Game.find({
      $or: [{ status: 'approved' }, { status: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .populate('uploaderId', 'email role displayName avatarUrl')
      .lean();

    if (games.length === 0) return res.json({ games });

    const ids = games.map((g) => g._id);
    const agg = await Review.aggregate([
      { $match: { gameId: { $in: ids } } },
      {
        $group: {
          _id: '$gameId',
          avg: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);
    const map = new Map(agg.map((a) => [String(a._id), a]));
    for (const g of games) {
      const s = map.get(String(g._id));
      g.ratingAvg = s ? Number(s.avg.toFixed(2)) : 0;
      g.ratingCount = s ? s.count : 0;
    }
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
    await attachRatingSummary(game);
    return res.json({ game });
  })
);

router.get(
  '/:id/reviews',
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid game id' });
    }
    const reviews = await Review.find({ gameId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'email displayName avatarUrl role')
      .lean();
    const agg = await Review.aggregate([
      { $match: { gameId: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);
    const summary = agg[0]
      ? { avg: Number(agg[0].avg.toFixed(2)), count: agg[0].count }
      : { avg: 0, count: 0 };
    return res.json({ reviews, summary });
  })
);

router.post(
  '/:id/reviews',
  auth,
  express.json(),
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid game id' });
    }
    const game = await Game.findById(req.params.id).lean();
    if (!game || (game.status && game.status !== 'approved')) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const ratingRaw = Number(req.body?.rating);
    if (!Number.isFinite(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
      return res.status(400).json({ message: 'RATING_INVALID' });
    }
    const rating = Math.round(ratingRaw);
    const text = String(req.body?.text || '').slice(0, 2000);

    const review = await Review.findOneAndUpdate(
      { gameId: game._id, userId: req.user._id },
      { $set: { rating, text } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate('userId', 'email displayName avatarUrl role')
      .lean();

    return res.status(201).json({ review });
  })
);

router.delete(
  '/:id/reviews/:reviewId',
  auth,
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.reviewId)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const isOwner = String(review.userId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await review.deleteOne();
    return res.json({ ok: true });
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
