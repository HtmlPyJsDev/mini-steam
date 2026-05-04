const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Game = require('../models/Game');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ users: [] });
    }
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'i');
    const users = await User.find({
      $or: [{ email: re }, { displayName: re }],
      _id: { $ne: req.user._id },
      banned: { $ne: true },
    })
      .select('email role displayName avatarUrl')
      .limit(15)
      .lean();
    return res.json({ users });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id).select(
      'email role displayName bio avatarUrl banned developerGameId friends subscribers createdAt lastSeenAt'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let developerGame = null;
    if (user.developerGameId) {
      developerGame = await Game.findById(user.developerGameId)
        .select('title coverUrl license status')
        .lean();
    }

    const me = req.user._id.toString();
    const targetId = user._id.toString();
    const friendIds = (user.friends || []).map((f) => f.toString());
    const subscriberIds = (user.subscribers || []).map((f) => f.toString());
    const isMe = me === targetId;
    const isFriend = friendIds.includes(me);
    const isSubscribed = subscriberIds.includes(me);
    const incoming = (req.user.friendRequestsIn || []).map((x) => x.toString());
    const outgoing = (req.user.friendRequestsOut || []).map((x) => x.toString());

    const ONLINE_WINDOW_MS = 90 * 1000;
    const online =
      !!user.lastSeenAt && Date.now() - new Date(user.lastSeenAt).getTime() < ONLINE_WINDOW_MS;

    return res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        displayName: user.displayName || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        banned: user.banned,
        createdAt: user.createdAt,
        lastSeenAt: user.lastSeenAt || null,
        online,
        friendsCount: friendIds.length,
        subscribersCount: subscriberIds.length,
        developerGame,
      },
      relation: {
        isMe,
        isFriend,
        isSubscribed,
        requestIncoming: incoming.includes(targetId),
        requestOutgoing: outgoing.includes(targetId),
      },
    });
  })
);

module.exports = router;
