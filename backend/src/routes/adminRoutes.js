const express = require('express');

const Game = require('../models/Game');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncHandler = require('../utils/asyncHandler');
const { gameUpload } = require('../middleware/upload');
const {
  buildKey,
  uploadBufferToR2,
  deleteFromR2,
} = require('../utils/r2Upload');

const router = express.Router();

router.use(auth, admin);

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

async function uploadGameFile(file) {
  const key = buildKey('games', file.originalname);
  const { publicUrl } = await uploadBufferToR2({
    buffer: file.buffer,
    key,
    contentType: file.mimetype,
  });
  return { key, url: publicUrl, size: file.size };
}

router.post(
  '/games',
  gameUpload,
  asyncHandler(async (req, res) => {
    requireFields(req.body, ['title', 'description', 'license']);

    const coverFile = req.files && req.files.cover && req.files.cover[0];
    const gameFile = req.files && req.files.gameFile && req.files.gameFile[0];
    const screenshotFiles = (req.files && req.files.screenshots) || [];

    if (!coverFile) {
      return res.status(400).json({ message: 'Cover image is required (field: cover)' });
    }
    if (!gameFile) {
      return res.status(400).json({ message: 'Game file is required (field: gameFile)' });
    }

    const cover = await uploadCover(coverFile);
    const screenshots = [];
    for (const f of screenshotFiles) {
      const s = await uploadScreenshot(f);
      screenshots.push(s.url);
    }
    const fileUpload = await uploadGameFile(gameFile);

    const game = await Game.create({
      title: String(req.body.title).trim(),
      description: String(req.body.description),
      license: String(req.body.license).trim(),
      coverUrl: cover.url,
      screenshots,
      fileUrl: fileUpload.url,
      fileKey: fileUpload.key,
      size: fileUpload.size,
    });

    return res.status(201).json({ game });
  })
);

router.put(
  '/games/:id',
  gameUpload,
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
    const gameFile = req.files && req.files.gameFile && req.files.gameFile[0];

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

    if (gameFile) {
      const oldKey = game.fileKey;
      const fileUpload = await uploadGameFile(gameFile);
      game.fileUrl = fileUpload.url;
      game.fileKey = fileUpload.key;
      game.size = fileUpload.size;
      if (oldKey && oldKey !== fileUpload.key) {
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

module.exports = router;
