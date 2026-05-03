const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const createToken = require('../utils/createToken');
const { verifyCaptcha } = require('../utils/captcha');

const router = express.Router();

const BCRYPT_ROUNDS = 10;

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, captchaId, captchaAnswer } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!captchaId || !captchaAnswer) {
      return res.status(400).json({ message: 'Captcha is required', code: 'CAPTCHA_REQUIRED' });
    }
    if (!verifyCaptcha(captchaId, captchaAnswer)) {
      return res.status(400).json({ message: 'Captcha is incorrect or expired', code: 'CAPTCHA_INVALID' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      email: normalizedEmail,
      password: hash,
      role: 'user',
    });

    const token = createToken(user);
    return res.status(201).json({ token, user: user.toSafeJSON() });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);
    return res.json({ token, user: user.toSafeJSON() });
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
      .populate('downloads', 'title coverUrl license size')
      .select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  })
);

module.exports = router;
