const express = require('express');

const mongoose = require('mongoose');

const Game = require('../models/Game');
const User = require('../models/User');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { getDownloadUrl } = require('../utils/r2Upload');
const uzisService = require('../services/uzis');

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

    const existing = await Review.findOne({ gameId: game._id, userId: req.user._id });
    let uzisGained = 0;
    let reviewDoc;
    if (existing) {
      existing.rating = rating;
      existing.text = text;
      // Reward eligibility: if not yet rewarded and new text passes threshold, reward
      if (!existing.rewarded && text.trim().length >= 30) {
        await uzisService.credit(req.user, uzisService.REVIEW_REWARD, 'review', {
          note: `Review on game: ${game.title}`,
          refId: existing._id,
        });
        existing.rewarded = true;
        uzisGained = uzisService.REVIEW_REWARD;
      }
      await existing.save();
      reviewDoc = existing;
    } else {
      const eligible = text.trim().length >= 30;
      reviewDoc = await Review.create({
        gameId: game._id,
        userId: req.user._id,
        rating,
        text,
        rewarded: eligible,
      });
      if (eligible) {
        await uzisService.credit(req.user, uzisService.REVIEW_REWARD, 'review', {
          note: `Review on game: ${game.title}`,
          refId: reviewDoc._id,
        });
        uzisGained = uzisService.REVIEW_REWARD;
      }
    }
    const populated = await Review.findById(reviewDoc._id)
      .populate('userId', 'email displayName avatarUrl role')
      .lean();
    return res.status(201).json({ review: populated, uzisGained });
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
    if (isOwner && review.rewarded) {
      try {
        await uzisService.debit(req.user, uzisService.REVIEW_REWARD, 'review_revoked', {
          note: 'Deleted own rewarded review',
          refId: review._id,
        });
      } catch (err) {
        if (err.code !== 'INSUFFICIENT_UZIS') throw err;
        // Allow deletion even if user has spent the uzis already
      }
    }
    await review.deleteOne();
    return res.json({ ok: true });
  })
);

// Return a signed download URL only if the user actually has access
// (game is free, the user is admin, the user uploaded it, or the user
// has bought / already owns it). Otherwise respond 402 with the price
// so the frontend can prompt the buy flow.
const downloadHandler = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) {
    return res.status(404).json({ message: 'Game not found' });
  }
  if (game.status && game.status !== 'approved') {
    return res.status(404).json({ message: 'Game not found' });
  }

  const me = await User.findById(req.user._id);
  if (!me) return res.status(401).json({ message: 'Unauthorized' });

  const meId = me._id.toString();
  const owns = (me.downloads || []).some((d) => d.toString() === meId || d.toString() === game._id.toString());
  const ownedAlready = (me.downloads || []).some((d) => d.toString() === game._id.toString());
  const isUploader = game.uploaderId && game.uploaderId.toString() === meId;
  const isAdmin = me.role === 'admin';
  const isFree = !game.priceUzis || game.priceUzis === 0;

  if (!isFree && !ownedAlready && !isUploader && !isAdmin) {
    return res.status(402).json({
      message: 'PAYMENT_REQUIRED',
      code: 'PAYMENT_REQUIRED',
      priceUzis: game.priceUzis,
      yourBalance: me.uzis || 0,
    });
  }

  if (!ownedAlready) {
    me.downloads = [...(me.downloads || []), game._id];
    await me.save();
  }
  void owns;

  const url = await getDownloadUrl(game.fileKey);
  return res.json({
    url,
    fileKey: game.fileKey,
    title: game.title,
    size: game.size,
    license: game.license,
  });
});

// Buy a paid game. Idempotent — buying a game you already own is a no-op
// and just returns the current balance.
router.post(
  '/:id/buy',
  auth,
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid game id' });
    }
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (game.status && game.status !== 'approved') {
      return res.status(404).json({ message: 'Game not found' });
    }
    const me = await User.findById(req.user._id);
    if (!me) return res.status(401).json({ message: 'Unauthorized' });

    const ownedAlready = (me.downloads || []).some((d) => d.toString() === game._id.toString());
    const isUploader = game.uploaderId && game.uploaderId.toString() === me._id.toString();
    const isAdmin = me.role === 'admin';
    const price = Math.max(0, Number(game.priceUzis) || 0);

    if (price === 0 || ownedAlready || isUploader || isAdmin) {
      if (!ownedAlready) {
        me.downloads = [...(me.downloads || []), game._id];
        await me.save();
      }
      return res.json({
        ok: true,
        alreadyOwned: ownedAlready,
        free: price === 0,
        uzis: me.uzis || 0,
      });
    }

    if ((me.uzis || 0) < price) {
      return res.status(400).json({
        message: 'INSUFFICIENT_UZIS',
        code: 'INSUFFICIENT_UZIS',
        need: price,
        have: me.uzis || 0,
      });
    }

    try {
      await uzisService.debit(me, price, 'game_purchase', {
        note: `Bought "${game.title}"`,
        refId: game._id,
      });
    } catch (err) {
      if (err && err.code === 'INSUFFICIENT_UZIS') {
        return res.status(400).json({ message: 'INSUFFICIENT_UZIS', code: 'INSUFFICIENT_UZIS', need: price });
      }
      throw err;
    }
    me.downloads = [...(me.downloads || []), game._id];
    await me.save();

    return res.json({ ok: true, uzis: me.uzis || 0, gameId: game._id });
  })
);

module.exports = router;
module.exports.downloadHandler = downloadHandler;
module.exports.auth = auth;
