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
} = require('../utils/r2Upload');

const router = express.Router();

const GAME_FILE_EXTENSIONS = /\.(zip|rar|7z|tar|gz|tgz|exe|msi|appimage|dmg|deb|pkg|iso)$/i;

router.use(auth, roleGuard('developer', 'admin'));

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
    });

    await User.updateOne({ _id: req.user._id }, { $set: { developerGameId: game._id } });

    return res.status(201).json({ game });
  })
);

module.exports = router;
