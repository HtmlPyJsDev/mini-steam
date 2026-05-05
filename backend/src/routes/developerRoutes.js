const express = require('express');

const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const asyncHandler = require('../utils/asyncHandler');
const { gameImagesUpload } = require('../middleware/upload');
const {
  buildKey,
  uploadBufferToR2,
  getPresignedPutUrl,
  createMultipartUpload,
  getPresignedPartUrls,
  completeMultipartUpload,
  abortMultipartUpload,
} = require('../utils/r2Upload');
const { getR2Config } = require('../config/r2');

const router = express.Router();

const GAME_FILE_EXTENSIONS = /\.(zip|rar|7z|tar|gz|tgz|exe|msi|appimage|dmg|deb|pkg|iso)$/i;

router.use(auth, roleGuard('developer', 'security', 'admin'));

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    let game = null;
    if (req.user.developerGameId) {
      game = await Game.findById(req.user.developerGameId).lean();
    }
    return res.json({ slotUsed: !!game, game });
  })
);

router.post(
  '/uploads/game-file/presign',
  express.json(),
  asyncHandler(async (req, res) => {
    if (req.user.developerGameId) {
      return res
        .status(409)
        .json({ message: 'Developer slot already used. You can only publish one game.' });
    }
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
  express.json(),
  asyncHandler(async (req, res) => {
    if (req.user.developerGameId) {
      return res
        .status(409)
        .json({ message: 'Developer slot already used. You can only publish one game.' });
    }
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
    const cfg = getR2Config();
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
  '/games',
  gameImagesUpload,
  asyncHandler(async (req, res) => {
    if (req.user.developerGameId) {
      return res
        .status(409)
        .json({ message: 'Developer slot already used. You can only publish one game.' });
    }

    const required = ['title', 'description', 'license', 'gameFileKey', 'gameFileUrl'];
    const missing = required.filter((f) => !req.body[f] || String(req.body[f]).trim() === '');
    if (missing.length) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

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

    // Authors choose Free (0) or paid (10 uzis). Anything else is normalised to 10.
    const priceUzisRaw = req.body.priceUzis;
    let priceUzis = 10;
    if (priceUzisRaw !== undefined && priceUzisRaw !== '') {
      const p = Math.round(Number(priceUzisRaw));
      if (Number.isFinite(p) && p === 0) priceUzis = 0;
      else priceUzis = 10;
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
      status: req.user.role === 'admin' ? 'approved' : 'pending',
      gpuTier,
      priceUzis,
    });

    await User.updateOne({ _id: req.user._id }, { $set: { developerGameId: game._id } });

    return res.status(201).json({ game });
  })
);

module.exports = router;
