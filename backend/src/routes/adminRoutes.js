const express = require('express');

const mongoose = require('mongoose');

const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncHandler = require('../utils/asyncHandler');
const { gameImagesUpload } = require('../middleware/upload');
const {
  buildKey,
  uploadBufferToR2,
  deleteFromR2,
  getPresignedPutUrl,
} = require('../utils/r2Upload');

const router = express.Router();

router.use(auth, admin);

const GAME_FILE_EXTENSIONS = /\.(zip|rar|7z|tar|gz|tgz|exe|msi|appimage|dmg|deb|pkg|iso)$/i;

function requireFields(body, fields) {
  const missing = fields.filter((f) => !body[f] || String(body[f]).trim() === '');
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }
}

async function uploadCover(file) {
  const key = buildKey('covers', file.originalname);
  const { publicUrl } = await uploadBufferToR2({
    buffer: file.buffer,
    key,
    contentType: file.mimetype,
  });
  return { key, url: publicUrl };
}

async function uploadScreenshot(file) {
  const key = buildKey('screenshots', file.originalname);
  const { publicUrl } = await uploadBufferToR2({
    buffer: file.buffer,
    key,
    contentType: file.mimetype,
  });
  return { key, url: publicUrl };
}

router.post(
  '/uploads/game-file/presign',
  express.json(),
  asyncHandler(async (req, res) => {
    const { filename, contentType } = req.body || {};
    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ message: 'filename is required' });
    }
    if (!GAME_FILE_EXTENSIONS.test(filename)) {
      return res.status(400).json({
        message:
          'Unsupported game file extension. Allowed: zip, rar, 7z, tar, gz, tgz, exe, msi, appimage, dmg, deb, pkg, iso',
      });
    }
    const key = buildKey('games', filename);
    const presigned = await getPresignedPutUrl({
      key,
      contentType: typeof contentType === 'string' ? contentType : 'application/octet-stream',
      ttlSeconds: 3600,
    });
    return res.json(presigned);
  })
);

router.post(
  '/games',
  gameImagesUpload,
  asyncHandler(async (req, res) => {
    requireFields(req.body, [
      'title',
      'description',
      'license',
      'gameFileKey',
      'gameFileUrl',
    ]);

    const coverFile = req.files && req.files.cover && req.files.cover[0];
    const screenshotFiles = (req.files && req.files.screenshots) || [];

    if (!coverFile) {
      return res.status(400).json({ message: 'Cover image is required (field: cover)' });
    }

    const cover = await uploadCover(coverFile);
    const screenshots = [];
    for (const f of screenshotFiles) {
      const s = await uploadScreenshot(f);
      screenshots.push(s.url);
    }

    const sizeRaw = req.body.gameFileSize;
    const size = sizeRaw === undefined || sizeRaw === '' ? 0 : Number(sizeRaw);
    if (!Number.isFinite(size) || size < 0) {
      return res.status(400).json({ message: 'gameFileSize must be a non-negative number' });
    }

    const game = await Game.create({
      title: String(req.body.title).trim(),
      description: String(req.body.description),
      license: String(req.body.license).trim(),
      coverUrl: cover.url,
      screenshots,
      fileUrl: String(req.body.gameFileUrl).trim(),
      fileKey: String(req.body.gameFileKey).trim(),
      size,
      uploaderId: req.user._id,
      status: 'approved',
    });

    return res.status(201).json({ game });
  })
);

router.put(
  '/games/:id',
  gameImagesUpload,
  asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (req.body.title !== undefined) game.title = String(req.body.title).trim();
    if (req.body.description !== undefined) game.description = String(req.body.description);
    if (req.body.license !== undefined) {
      const lic = String(req.body.license).trim();
      if (!lic) {
        return res.status(400).json({ message: 'License cannot be empty' });
      }
      game.license = lic;
    }

    const coverFile = req.files && req.files.cover && req.files.cover[0];
    const screenshotFiles = (req.files && req.files.screenshots) || [];

    if (coverFile) {
      const cover = await uploadCover(coverFile);
      game.coverUrl = cover.url;
    }

    if (screenshotFiles.length > 0) {
      const newShots = [];
      for (const f of screenshotFiles) {
        const s = await uploadScreenshot(f);
        newShots.push(s.url);
      }
      game.screenshots = newShots;
    }

    if (req.body.gameFileKey && req.body.gameFileUrl) {
      const oldKey = game.fileKey;
      const newKey = String(req.body.gameFileKey).trim();
      const newUrl = String(req.body.gameFileUrl).trim();
      const sizeRaw = req.body.gameFileSize;
      const size = sizeRaw === undefined || sizeRaw === '' ? game.size : Number(sizeRaw);
      if (!Number.isFinite(size) || size < 0) {
        return res.status(400).json({ message: 'gameFileSize must be a non-negative number' });
      }
      game.fileUrl = newUrl;
      game.fileKey = newKey;
      game.size = size;
      if (oldKey && oldKey !== newKey) {
        try {
          await deleteFromR2(oldKey);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[mini-steam] Failed to delete old file from R2:', err.message);
        }
      }
    }

    await game.save();
    return res.json({ game });
  })
);

router.delete(
  '/games/:id',
  asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const fileKey = game.fileKey;
    await game.deleteOne();

    if (fileKey) {
      try {
        await deleteFromR2(fileKey);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[mini-steam] Failed to delete game file from R2:', err.message);
      }
    }

    return res.json({ ok: true });
  })
);

// ===== Game moderation =====

router.get(
  '/games/pending',
  asyncHandler(async (_req, res) => {
    const games = await Game.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('uploaderId', 'email role displayName avatarUrl')
      .lean();
    return res.json({ games });
  })
);

router.patch(
  '/games/:id/status',
  express.json(),
  asyncHandler(async (req, res) => {
    const status = String(req.body?.status || '').trim();
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'status must be approved | rejected | pending' });
    }
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!game) return res.status(404).json({ message: 'Game not found' });
    return res.json({ game });
  })
);

// ===== User management =====

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    const filter = {};
    if (q.length >= 1) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      filter.$or = [{ email: re }, { displayName: re }];
    }
    const users = await User.find(filter)
      .select('email role displayName avatarUrl banned bannedReason developerGameId createdAt')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return res.json({ users });
  })
);

router.patch(
  '/users/:id/role',
  express.json(),
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const role = String(req.body?.role || '').trim();
    if (!['user', 'developer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'role must be user | developer | admin' });
    }
    if (req.user._id.equals(req.params.id) && role !== 'admin') {
      return res.status(400).json({ message: 'Admins cannot demote themselves' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  })
);

router.post(
  '/users/:id/ban',
  express.json(),
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (req.user._id.equals(req.params.id)) {
      return res.status(400).json({ message: 'Admins cannot ban themselves' });
    }
    const reason = String(req.body?.reason || '').slice(0, 200);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { banned: true, bannedReason: reason },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  })
);

router.post(
  '/users/:id/unban',
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { banned: false, bannedReason: '' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  })
);

module.exports = router;
