const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const UzisLedger = require('../models/UzisLedger');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const createToken = require('../utils/createToken');
const { verifyCaptcha } = require('../utils/captcha');

const WELCOME_BONUS = 50;

// One-shot bonus for both fresh registrations and existing accounts that
// pre-date the uzis economy. Mutates and saves the user.
async function ensureWelcomeBonus(user) {
  if (user.welcomeBonusGranted) return;
  const before = user.uzis || 0;
  // For existing accounts with zero balance: top up to WELCOME_BONUS.
  // For brand-new accounts the schema default already gave them 50 — we
  // just need to log it and flip the flag.
  let delta = 0;
  if (before < WELCOME_BONUS) {
    delta = WELCOME_BONUS - before;
    user.uzis = WELCOME_BONUS;
  }
  user.welcomeBonusGranted = true;
  await user.save();
  if (delta > 0 || before === WELCOME_BONUS) {
    await UzisLedger.create({
      userId: user._id,
      delta: delta > 0 ? delta : WELCOME_BONUS,
      balanceAfter: user.uzis,
      reason: 'welcome_bonus',
      note: 'Welcome bonus on first sign-in',
    });
  }
}

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
    await ensureWelcomeBonus(user);

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
    if (user.banned) {
      return res.status(403).json({
        message: user.bannedReason
          ? `Account is banned: ${user.bannedReason}`
          : 'Account is banned',
        code: 'BANNED',
      });
    }

    await ensureWelcomeBonus(user);

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
    await ensureWelcomeBonus(user);
    return res.json({ user });
  })
);

module.exports = router;
