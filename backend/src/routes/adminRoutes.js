const express = require('express');

const mongoose = require('mongoose');

const Game = require('../models/Game');
const User = require('../models/User');
const RolePurchase = require('../models/RolePurchase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const roleGuard = require('../middleware/roleGuard');
const asyncHandler = require('../utils/asyncHandler');
const { gameImagesUpload } = require('../middleware/upload');
const {
  buildKey,
  uploadBufferToR2,
  deleteFromR2,
  getPresignedPutUrl,
  createMultipartUpload,
  getPresignedPartUrls,
  completeMultipartUpload,
  abortMultipartUpload,
} = require('../utils/r2Upload');

const router = express.Router();

router.use(auth);
const adminOnly = admin;
const adminOrSecurity = roleGuard('admin', 'security');

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
  adminOnly,
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
  '/uploads/game-file/multipart/init',
  adminOnly,
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
    const cfg = require('../config/r2').getR2Config();
    const key = buildKey('games', filename);
    const { uploadId } = await createMultipartUpload({
      key,
      contentType: typeof contentType === 'string' ? contentType : 'application/octet-stream',
    });
    return res.json({
      key,
      uploadId,
      publicUrl: cfg.publicBaseUrl ? `${cfg.publicBaseUrl.replace(/\/$/, '')}/${key}` : '',
    });
  })
);

router.post(
  '/uploads/game-file/multipart/sign',
  adminOnly,
  express.json(),
  asyncHandler(async (req, res) => {
    const { key, uploadId, partNumbers } = req.body || {};
    if (!key || !uploadId || !Array.isArray(partNumbers) || partNumbers.length === 0) {
      return res.status(400).json({ message: 'key, uploadId, partNumbers[] are required' });
    }
    const nums = partNumbers
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 10000);
    if (nums.length === 0) {
      return res.status(400).json({ message: 'partNumbers must be 1..10000 integers' });
    }
    if (nums.length > 100) {
      return res.status(400).json({ message: 'Too many partNumbers in one request (max 100)' });
    }
    const urls = await getPresignedPartUrls({ key, uploadId, partNumbers: nums, ttlSeconds: 3600 });
    return res.json({ urls });
  })
);

router.post(
  '/uploads/game-file/multipart/complete',
  adminOnly,
  express.json(),
  asyncHandler(async (req, res) => {
    const { key, uploadId, parts } = req.body || {};
    if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({ message: 'key, uploadId, parts[] are required' });
    }
    const cleaned = parts
      .map((p) => ({
        PartNumber: Number(p?.partNumber ?? p?.PartNumber),
        ETag: String(p?.eTag ?? p?.ETag ?? '').trim(),
      }))
      .filter((p) => Number.isInteger(p.PartNumber) && p.ETag);
    if (cleaned.length === 0) {
      return res.status(400).json({ message: 'parts must have partNumber and eTag' });
    }
    const result = await completeMultipartUpload({ key, uploadId, parts: cleaned });
    return res.json(result);
  })
);

router.post(
  '/uploads/game-file/multipart/abort',
  adminOnly,
  express.json(),
  asyncHandler(async (req, res) => {
    const { key, uploadId } = req.body || {};
    if (!key || !uploadId) return res.status(400).json({ message: 'key, uploadId required' });
    try {
      await abortMultipartUpload({ key, uploadId });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[mini-steam] abort multipart failed:', err.message);
    }
    return res.json({ ok: true });
  })
);

router.post(
  '/games',
  adminOnly,
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

    const gpuTierRaw = req.body.gpuTier;
    let gpuTier = 0;
    if (gpuTierRaw !== undefined && gpuTierRaw !== '') {
      const t = Math.round(Number(gpuTierRaw));
      if (Number.isFinite(t) && t >= 0 && t <= 5) gpuTier = t;
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
      gpuTier,
    });

    return res.status(201).json({ game });
  })
);

router.put(
  '/games/:id',
  adminOnly,
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
    if (req.body.gpuTier !== undefined && req.body.gpuTier !== '') {
      const t = Math.round(Number(req.body.gpuTier));
      if (Number.isFinite(t) && t >= 0 && t <= 5) game.gpuTier = t;
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
  adminOnly,
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
  adminOrSecurity,
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
  adminOrSecurity,
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
  adminOrSecurity,
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
  adminOnly,
  express.json(),
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const role = String(req.body?.role || '').trim();
    if (!['user', 'developer', 'security', 'admin'].includes(role)) {
      return res
        .status(400)
        .json({ message: 'role must be user | developer | security | admin' });
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
  adminOrSecurity,
  express.json(),
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (req.user._id.equals(req.params.id)) {
      return res.status(400).json({ message: 'You cannot ban yourself' });
    }
    const target = await User.findById(req.params.id).select('role');
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot be banned' });
    }
    if (req.user.role === 'security' && target.role === 'security') {
      return res.status(403).json({ message: 'Security cannot ban other security users' });
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
  adminOrSecurity,
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

const ROLE_RANK = { user: 0, developer: 1, security: 2, admin: 3 };

router.get(
  '/role-requests',
  adminOrSecurity,
  asyncHandler(async (req, res) => {
    const status = req.query.status ? String(req.query.status) : 'requested';
    const filter = status === 'all' ? {} : { status };
    const requests = await RolePurchase.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('userId', 'email displayName avatarUrl role banned')
      .populate('grantedBy', 'email displayName')
      .lean();
    return res.json({ requests });
  })
);

router.post(
  '/role-requests/:id/grant',
  adminOnly,
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid request id' });
    }
    const request = await RolePurchase.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'requested') {
      return res
        .status(400)
        .json({ message: 'Request is not pending' });
    }

    const target = await User.findById(request.userId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const currentRank = ROLE_RANK[target.role] ?? 0;
    const targetRank = ROLE_RANK[request.role] ?? 0;
    if (currentRank < targetRank) {
      target.role = request.role;
      await target.save();
    }

    request.status = 'granted';
    request.grantedBy = req.user._id;
    request.grantedAt = new Date();
    await request.save();

    return res.json({ request, user: target.toObject({ versionKey: false }) });
  })
);

router.post(
  '/role-requests/:id/reject',
  adminOnly,
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid request id' });
    }
    const request = await RolePurchase.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'requested') {
      return res
        .status(400)
        .json({ message: 'Request is not pending' });
    }
    request.status = 'rejected';
    request.grantedBy = req.user._id;
    request.grantedAt = new Date();
    await request.save();
    return res.json({ request });
  })
);

module.exports = router;
