const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const { createCaptcha } = require('../utils/captcha');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const challenge = createCaptcha();
    res.set('Cache-Control', 'no-store');
    return res.json(challenge);
  })
);

module.exports = router;
