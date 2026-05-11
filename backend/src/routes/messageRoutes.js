const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);

function asId(s) {
  if (!mongoose.Types.ObjectId.isValid(s)) return null;
  return new mongoose.Types.ObjectId(s);
}

router.get(
  '/conversations',
  asyncHandler(async (req, res) => {
    const meId = req.user._id;
    const me = await User.findById(meId)
      .populate('friends', 'email role displayName avatarUrl')
      .select('friends');

    const friendIds = (me.friends || []).map((f) => f._id);
    if (friendIds.length === 0) {
      return res.json({ conversations: [] });
    }

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: meId, to: { $in: friendIds } },
            { from: { $in: friendIds }, to: meId },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$from', meId] }, '$to', '$from'],
          },
          lastMessage: { $first: '$$ROOT' },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$to', meId] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const byId = new Map(messages.map((m) => [m._id.toString(), m]));
    const conversations = me.friends.map((friend) => {
      const entry = byId.get(friend._id.toString());
      return {
        friend,
        lastMessage: entry ? entry.lastMessage : null,
        unread: entry ? entry.unread : 0,
      };
    });
    conversations.sort((a, b) => {
      const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tb - ta;
    });

    return res.json({ conversations });
  })
);

router.get(
  '/:friendId',
  asyncHandler(async (req, res) => {
    const friendId = asId(req.params.friendId);
    if (!friendId) return res.status(400).json({ message: 'Invalid friend id' });

    const me = await User.findById(req.user._id).select('friends');
    if (!me.friends.some((f) => f.equals(friendId))) {
      return res.status(403).json({ message: 'Not friends with this user' });
    }

    const friend = await User.findById(friendId).select('email role displayName avatarUrl');
    if (!friend) return res.status(404).json({ message: 'User not found' });

    const messages = await Message.find({
      $or: [
        { from: req.user._id, to: friendId },
        { from: friendId, to: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    // Mark incoming as read
    await Message.updateMany(
      { from: friendId, to: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.json({ friend, messages });
  })
);

router.post(
  '/:friendId',
  asyncHandler(async (req, res) => {
    const friendId = asId(req.params.friendId);
    if (!friendId) return res.status(400).json({ message: 'Invalid friend id' });
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Message text is required' });
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Message is too long (max 2000)' });
    }

    const me = await User.findById(req.user._id).select('friends');
    if (!me.friends.some((f) => f.equals(friendId))) {
      return res.status(403).json({ message: 'Not friends with this user' });
    }

    const message = await Message.create({
      from: req.user._id,
      to: friendId,
      text,
      read: false,
    });
    return res.status(201).json({ message });
  })
);

module.exports = router;
