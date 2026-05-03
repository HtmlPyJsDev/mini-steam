const express = require('express');

const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { avatarUpload } = require('../middleware/upload');
const { buildKey, uploadBufferToR2, deleteFromR2 } = require('../utils/r2Upload');

const router = express.Router();

router.use(auth);

router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const { displayName, bio } = req.body || {};
    const update = {};
    if (displayName !== undefined) {
      const trimmed = String(displayName).trim();
      if (trimmed.length > 40) {
        return res.status(400).json({ message: 'Display name is too long (max 40)' });
      }
      update.displayName = trimmed;
    }
    if (bio !== undefined) {
      const trimmed = String(bio);
      if (trimmed.length > 280) {
        return res.status(400).json({ message: 'Bio is too long (max 280)' });
      }
      update.bio = trimmed;
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    }).select('-password');
    return res.json({ user });
  })
);

router.post(
  '/avatar',
  avatarUpload,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'avatar file is required' });
    }
    const key = buildKey('avatars', req.file.originalname);
    const { publicUrl } = await uploadBufferToR2({
      buffer: req.file.buffer,
      key,
      contentType: req.file.mimetype,
    });

    const oldKey = req.user.avatarKey;
    req.user.avatarUrl = publicUrl;
    req.user.avatarKey = key;
    await req.user.save();

    if (oldKey && oldKey !== key) {
      try {
        await deleteFromR2(oldKey);
      } catch {
        // ignore: not fatal
      }
    }

    return res.json({ avatarUrl: publicUrl, user: req.user.toSafeJSON() });
  })
);

router.delete(
  '/avatar',
  asyncHandler(async (req, res) => {
    const oldKey = req.user.avatarKey;
    req.user.avatarUrl = '';
    req.user.avatarKey = '';
    await req.user.save();
    if (oldKey) {
      try {
        await deleteFromR2(oldKey);
      } catch {
        // ignore
      }
    }
    return res.json({ user: req.user.toSafeJSON() });
  })
);

module.exports = router;
