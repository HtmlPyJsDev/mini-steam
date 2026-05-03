const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);

const PUBLIC_FIELDS = 'email role displayName avatarUrl';

function asId(s) {
  if (!mongoose.Types.ObjectId.isValid(s)) return null;
  return new mongoose.Types.ObjectId(s);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const me = await User.findById(req.user._id)
      .populate('friends', PUBLIC_FIELDS)
      .populate('friendRequestsIn', PUBLIC_FIELDS)
      .populate('friendRequestsOut', PUBLIC_FIELDS)
      .select('friends friendRequestsIn friendRequestsOut');
    return res.json({
      friends: me.friends || [],
      requestsIncoming: me.friendRequestsIn || [],
      requestsOutgoing: me.friendRequestsOut || [],
    });
  })
);

router.post(
  '/request/:userId',
  asyncHandler(async (req, res) => {
    const targetId = asId(req.params.userId);
    if (!targetId) return res.status(400).json({ message: 'Invalid user id' });
    if (targetId.equals(req.user._id)) {
      return res.status(400).json({ message: 'Cannot friend yourself' });
    }
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.banned) return res.status(400).json({ message: 'User is banned' });

    const me = await User.findById(req.user._id);
    if (me.friends.some((f) => f.equals(targetId))) {
      return res.status(409).json({ message: 'Already friends' });
    }
    if (me.friendRequestsOut.some((f) => f.equals(targetId))) {
      return res.status(409).json({ message: 'Request already sent' });
    }
    // If target already requested us, accept automatically.
    if (me.friendRequestsIn.some((f) => f.equals(targetId))) {
      me.friendRequestsIn = me.friendRequestsIn.filter((f) => !f.equals(targetId));
      me.friends.push(targetId);
      target.friendRequestsOut = target.friendRequestsOut.filter((f) => !f.equals(req.user._id));
      target.friends.push(req.user._id);
      await Promise.all([me.save(), target.save()]);
      return res.json({ status: 'accepted' });
    }

    me.friendRequestsOut.push(targetId);
    target.friendRequestsIn.push(req.user._id);
    await Promise.all([me.save(), target.save()]);
    return res.json({ status: 'sent' });
  })
);

router.post(
  '/accept/:userId',
  asyncHandler(async (req, res) => {
    const targetId = asId(req.params.userId);
    if (!targetId) return res.status(400).json({ message: 'Invalid user id' });
    const me = await User.findById(req.user._id);
    if (!me.friendRequestsIn.some((f) => f.equals(targetId))) {
      return res.status(404).json({ message: 'No incoming request from this user' });
    }
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    me.friendRequestsIn = me.friendRequestsIn.filter((f) => !f.equals(targetId));
    if (!me.friends.some((f) => f.equals(targetId))) me.friends.push(targetId);
    target.friendRequestsOut = target.friendRequestsOut.filter((f) => !f.equals(req.user._id));
    if (!target.friends.some((f) => f.equals(req.user._id))) target.friends.push(req.user._id);

    await Promise.all([me.save(), target.save()]);
    return res.json({ status: 'accepted' });
  })
);

router.post(
  '/reject/:userId',
  asyncHandler(async (req, res) => {
    const targetId = asId(req.params.userId);
    if (!targetId) return res.status(400).json({ message: 'Invalid user id' });
    const me = await User.findById(req.user._id);
    me.friendRequestsIn = me.friendRequestsIn.filter((f) => !f.equals(targetId));
    await me.save();
    await User.updateOne(
      { _id: targetId },
      { $pull: { friendRequestsOut: req.user._id } }
    );
    return res.json({ status: 'rejected' });
  })
);

router.delete(
  '/:userId',
  asyncHandler(async (req, res) => {
    const targetId = asId(req.params.userId);
    if (!targetId) return res.status(400).json({ message: 'Invalid user id' });
    await User.updateOne(
      { _id: req.user._id },
      {
        $pull: {
          friends: targetId,
          friendRequestsIn: targetId,
          friendRequestsOut: targetId,
        },
      }
    );
    await User.updateOne(
      { _id: targetId },
      {
        $pull: {
          friends: req.user._id,
          friendRequestsIn: req.user._id,
          friendRequestsOut: req.user._id,
        },
      }
    );
    return res.json({ status: 'removed' });
  })
);

module.exports = router;
