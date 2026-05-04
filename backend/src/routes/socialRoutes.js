const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const GlobalMessage = require('../models/GlobalMessage');
const DevUpdate = require('../models/DevUpdate');
const Game = require('../models/Game');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { updateImageUpload } = require('../middleware/upload');
const { buildKey, uploadBufferToR2 } = require('../utils/r2Upload');
const uzisService = require('../services/uzis');

const router = express.Router();

const PUBLIC_FIELDS = 'email role displayName avatarUrl lastSeenAt';
const ONLINE_WINDOW_MS = 90 * 1000;

function asId(s) {
  if (!mongoose.Types.ObjectId.isValid(s)) return null;
  return new mongoose.Types.ObjectId(s);
}

function isOnline(u) {
  if (!u || !u.lastSeenAt) return false;
  return Date.now() - new Date(u.lastSeenAt).getTime() < ONLINE_WINDOW_MS;
}

function publicProfile(u) {
  if (!u) return null;
  const obj = u.toObject ? u.toObject() : u;
  return {
    _id: obj._id,
    email: obj.email,
    role: obj.role,
    displayName: obj.displayName || '',
    avatarUrl: obj.avatarUrl || '',
    lastSeenAt: obj.lastSeenAt || null,
    online: isOnline(obj),
  };
}

// ===== Presence =====
router.post(
  '/presence/heartbeat',
  auth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    user.lastSeenAt = new Date();
    const accrual = await uzisService.maybeAccruePresence(user);
    return res.json({
      ok: true,
      lastSeenAt: user.lastSeenAt,
      uzis: user.uzis || 0,
      gained: accrual.gained,
      capped: accrual.capped,
    });
  })
);

router.get(
  '/presence/online',
  auth,
  asyncHandler(async (_req, res) => {
    const since = new Date(Date.now() - ONLINE_WINDOW_MS);
    const users = await User.find({
      lastSeenAt: { $gte: since },
      banned: { $ne: true },
    })
      .select(PUBLIC_FIELDS)
      .sort({ lastSeenAt: -1 })
      .limit(60);
    return res.json({
      users: users.map(publicProfile),
      onlineCount: users.length,
    });
  })
);

// ===== Global chat =====
router.get(
  '/global-chat',
  auth,
  asyncHandler(async (_req, res) => {
    const messages = await GlobalMessage.find()
      .sort({ createdAt: -1 })
      .limit(80)
      .populate('from', PUBLIC_FIELDS)
      .lean();
    messages.reverse();
    return res.json({
      messages: messages.map((m) => ({
        _id: m._id,
        text: m.text,
        createdAt: m.createdAt,
        from: m.from
          ? {
              _id: m.from._id,
              email: m.from.email,
              role: m.from.role,
              displayName: m.from.displayName || '',
              avatarUrl: m.from.avatarUrl || '',
            }
          : null,
      })),
    });
  })
);

router.post(
  '/global-chat',
  auth,
  express.json(),
  asyncHandler(async (req, res) => {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Message text is required' });
    if (text.length > 600) {
      return res.status(400).json({ message: 'Message is too long (max 600)' });
    }
    const created = await GlobalMessage.create({
      from: req.user._id,
      text,
    });
    const populated = await GlobalMessage.findById(created._id).populate('from', PUBLIC_FIELDS);
    const m = populated.toObject();
    return res.status(201).json({
      message: {
        _id: m._id,
        text: m.text,
        createdAt: m.createdAt,
        from: m.from
          ? {
              _id: m.from._id,
              email: m.from.email,
              role: m.from.role,
              displayName: m.from.displayName || '',
              avatarUrl: m.from.avatarUrl || '',
            }
          : null,
      },
    });
  })
);

// ===== Groups =====
router.get(
  '/groups',
  auth,
  asyncHandler(async (req, res) => {
    const groups = await Group.find({ members: req.user._id })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .populate('members', PUBLIC_FIELDS)
      .populate('ownerId', PUBLIC_FIELDS)
      .lean();
    return res.json({ groups });
  })
);

router.post(
  '/groups',
  auth,
  express.json(),
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Group name is required' });
    if (name.length > 60) return res.status(400).json({ message: 'Name is too long' });

    const inputMembers = Array.isArray(req.body?.memberIds) ? req.body.memberIds : [];
    const memberIds = new Set();
    memberIds.add(req.user._id.toString());
    for (const idStr of inputMembers) {
      if (typeof idStr !== 'string') continue;
      if (!mongoose.Types.ObjectId.isValid(idStr)) continue;
      memberIds.add(idStr);
    }
    if (memberIds.size > 30) {
      return res.status(400).json({ message: 'Too many members (max 30)' });
    }

    const validMembers = await User.find({
      _id: { $in: Array.from(memberIds) },
      banned: { $ne: true },
    }).select('_id');
    const validIds = validMembers.map((u) => u._id);

    const group = await Group.create({
      name,
      ownerId: req.user._id,
      members: validIds,
      lastMessageAt: new Date(),
    });
    const populated = await Group.findById(group._id)
      .populate('members', PUBLIC_FIELDS)
      .populate('ownerId', PUBLIC_FIELDS)
      .lean();
    return res.status(201).json({ group: populated });
  })
);

router.post(
  '/groups/:id/members',
  auth,
  express.json(),
  asyncHandler(async (req, res) => {
    const groupId = asId(req.params.id);
    if (!groupId) return res.status(400).json({ message: 'Invalid group id' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.ownerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the owner can add members' });
    }

    const inputMembers = Array.isArray(req.body?.memberIds) ? req.body.memberIds : [];
    const incoming = inputMembers
      .filter((s) => typeof s === 'string' && mongoose.Types.ObjectId.isValid(s))
      .map((s) => new mongoose.Types.ObjectId(s));
    const validMembers = await User.find({
      _id: { $in: incoming },
      banned: { $ne: true },
    }).select('_id');

    const memberSet = new Set(group.members.map((m) => m.toString()));
    for (const u of validMembers) memberSet.add(u._id.toString());
    group.members = Array.from(memberSet);
    await group.save();

    const populated = await Group.findById(group._id)
      .populate('members', PUBLIC_FIELDS)
      .populate('ownerId', PUBLIC_FIELDS)
      .lean();
    return res.json({ group: populated });
  })
);

router.delete(
  '/groups/:id/leave',
  auth,
  asyncHandler(async (req, res) => {
    const groupId = asId(req.params.id);
    if (!groupId) return res.status(400).json({ message: 'Invalid group id' });
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.ownerId.equals(req.user._id)) {
      // Owner leaving deletes the group
      await GroupMessage.deleteMany({ groupId: group._id });
      await Group.deleteOne({ _id: group._id });
      return res.json({ deleted: true });
    }

    group.members = group.members.filter((m) => !m.equals(req.user._id));
    await group.save();
    return res.json({ left: true });
  })
);

router.get(
  '/groups/:id/messages',
  auth,
  asyncHandler(async (req, res) => {
    const groupId = asId(req.params.id);
    if (!groupId) return res.status(400).json({ message: 'Invalid group id' });
    const group = await Group.findById(groupId).select('members');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.some((m) => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }
    const messages = await GroupMessage.find({ groupId })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate('from', PUBLIC_FIELDS)
      .lean();
    return res.json({ messages });
  })
);

router.post(
  '/groups/:id/messages',
  auth,
  express.json(),
  asyncHandler(async (req, res) => {
    const groupId = asId(req.params.id);
    if (!groupId) return res.status(400).json({ message: 'Invalid group id' });
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Message text is required' });
    if (text.length > 2000) return res.status(400).json({ message: 'Message too long' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.some((m) => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }
    const msg = await GroupMessage.create({ groupId, from: req.user._id, text });
    group.lastMessageAt = new Date();
    await group.save();
    const populated = await GroupMessage.findById(msg._id).populate('from', PUBLIC_FIELDS).lean();
    return res.status(201).json({ message: populated });
  })
);

// ===== Subscriptions (follow developer) =====
router.post(
  '/subscriptions/:userId',
  auth,
  asyncHandler(async (req, res) => {
    const targetId = asId(req.params.userId);
    if (!targetId) return res.status(400).json({ message: 'Invalid user id' });
    if (targetId.equals(req.user._id)) {
      return res.status(400).json({ message: "You can't subscribe to yourself" });
    }
    const target = await User.findById(targetId).select('_id banned subscribers');
    if (!target || target.banned) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.updateOne({ _id: req.user._id }, { $addToSet: { subscribedTo: targetId } });
    await User.updateOne({ _id: targetId }, { $addToSet: { subscribers: req.user._id } });
    const updated = await User.findById(targetId).select('subscribers');
    return res.json({ subscribed: true, subscriberCount: (updated.subscribers || []).length });
  })
);

router.delete(
  '/subscriptions/:userId',
  auth,
  asyncHandler(async (req, res) => {
    const targetId = asId(req.params.userId);
    if (!targetId) return res.status(400).json({ message: 'Invalid user id' });
    await User.updateOne({ _id: req.user._id }, { $pull: { subscribedTo: targetId } });
    await User.updateOne({ _id: targetId }, { $pull: { subscribers: req.user._id } });
    const updated = await User.findById(targetId).select('subscribers');
    return res.json({
      subscribed: false,
      subscriberCount: updated ? (updated.subscribers || []).length : 0,
    });
  })
);

router.get(
  '/users/:userId/subscribers',
  asyncHandler(async (req, res) => {
    const targetId = asId(req.params.userId);
    if (!targetId) return res.status(400).json({ message: 'Invalid user id' });
    const target = await User.findById(targetId)
      .populate('subscribers', PUBLIC_FIELDS)
      .select('subscribers');
    if (!target) return res.status(404).json({ message: 'User not found' });
    return res.json({
      subscribers: (target.subscribers || []).map(publicProfile),
      count: (target.subscribers || []).length,
    });
  })
);

// ===== Developer updates (image + caption posts) =====
router.get(
  '/users/:userId/updates',
  asyncHandler(async (req, res) => {
    const targetId = asId(req.params.userId);
    if (!targetId) return res.status(400).json({ message: 'Invalid user id' });
    const updates = await DevUpdate.find({ authorId: targetId })
      .sort({ createdAt: -1 })
      .limit(40)
      .populate('authorId', PUBLIC_FIELDS)
      .populate('gameId', 'title coverUrl')
      .lean();
    return res.json({ updates });
  })
);

router.get(
  '/games/:gameId/updates',
  asyncHandler(async (req, res) => {
    const gameId = asId(req.params.gameId);
    if (!gameId) return res.status(400).json({ message: 'Invalid game id' });
    const updates = await DevUpdate.find({ gameId })
      .sort({ createdAt: -1 })
      .limit(40)
      .populate('authorId', PUBLIC_FIELDS)
      .lean();
    return res.json({ updates });
  })
);

router.get(
  '/feed/updates',
  auth,
  asyncHandler(async (req, res) => {
    const me = await User.findById(req.user._id).select('subscribedTo');
    const ids = (me.subscribedTo || []).map((u) => u);
    if (ids.length === 0) return res.json({ updates: [] });
    const updates = await DevUpdate.find({ authorId: { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(40)
      .populate('authorId', PUBLIC_FIELDS)
      .populate('gameId', 'title coverUrl')
      .lean();
    return res.json({ updates });
  })
);

router.post(
  '/updates',
  auth,
  updateImageUpload,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'developer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only developers can post updates' });
    }
    const caption = String(req.body?.caption || '').trim();
    if (!caption) return res.status(400).json({ message: 'Caption is required' });
    if (caption.length > 600) return res.status(400).json({ message: 'Caption too long (max 600)' });

    let imageUrl = '';
    let imageKey = '';
    if (req.file) {
      const key = buildKey('updates', req.file.originalname);
      const { publicUrl } = await uploadBufferToR2({
        buffer: req.file.buffer,
        key,
        contentType: req.file.mimetype,
      });
      imageUrl = publicUrl;
      imageKey = key;
    }

    let gameId = null;
    if (req.user.role === 'developer') {
      const fresh = await User.findById(req.user._id).select('developerGameId');
      if (fresh && fresh.developerGameId) gameId = fresh.developerGameId;
    }
    if (req.body && req.body.gameId && mongoose.Types.ObjectId.isValid(req.body.gameId)) {
      // Allow admin to attach to any game; developer can only attach to their own
      if (req.user.role === 'admin') {
        gameId = new mongoose.Types.ObjectId(req.body.gameId);
      } else if (gameId && String(gameId) === String(req.body.gameId)) {
        gameId = new mongoose.Types.ObjectId(req.body.gameId);
      }
    }

    const update = await DevUpdate.create({
      authorId: req.user._id,
      gameId,
      caption,
      imageUrl,
      imageKey,
    });
    const populated = await DevUpdate.findById(update._id)
      .populate('authorId', PUBLIC_FIELDS)
      .populate('gameId', 'title coverUrl')
      .lean();
    return res.status(201).json({ update: populated });
  })
);

router.delete(
  '/updates/:id',
  auth,
  asyncHandler(async (req, res) => {
    const updateId = asId(req.params.id);
    if (!updateId) return res.status(400).json({ message: 'Invalid update id' });
    const update = await DevUpdate.findById(updateId);
    if (!update) return res.status(404).json({ message: 'Update not found' });
    if (req.user.role !== 'admin' && !update.authorId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the author or admin can delete this' });
    }
    await DevUpdate.deleteOne({ _id: updateId });
    return res.json({ deleted: true });
  })
);

module.exports = router;
