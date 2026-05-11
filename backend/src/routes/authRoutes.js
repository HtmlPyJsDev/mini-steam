const express = require('express');
const bcrypt = require('bcrypt');
const axios = require('axios');

const User = require('../models/User');
const UzisLedger = require('../models/UzisLedger');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const createToken = require('../utils/createToken');
const { verifyCaptcha } = require('../utils/captcha');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

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

router.get('/github', (req, res) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).json({ message: 'GitHub OAuth not configured' });
  }
  const scope = 'read:user';
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  res.redirect(githubAuthUrl);
});

router.get(
  '/github/callback',
  asyncHandler(async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${CLIENT_URL}/login?error=no_code`);
    }

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      return res.redirect(`${CLIENT_URL}/login?error=no_token`);
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: githubId, login, avatar_url } = userResponse.data;

    let user = await User.findOne({ githubId });
    if (!user) {
      const existingEmail = await User.findOne({ email: `${login}@github.local` });
      if (existingEmail) {
        return res.redirect(`${CLIENT_URL}/login?error=email_exists`);
      }

      user = await User.create({
        email: `${login}@github.local`,
        password: null,
        provider: 'github',
        githubId: String(githubId),
        displayName: login,
        avatarUrl: avatar_url,
        role: 'user',
      });
      await ensureWelcomeBonus(user);
    }

    if (user.banned) {
      return res.redirect(`${CLIENT_URL}/login?error=banned`);
    }

    const token = createToken(user);
    res.redirect(`${CLIENT_URL}/auth/github/callback?token=${token}`);
  })
);

module.exports = router;
