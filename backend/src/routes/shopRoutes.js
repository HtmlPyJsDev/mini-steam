const express = require('express');

const User = require('../models/User');
const RolePurchase = require('../models/RolePurchase');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const ROLES = [
  {
    id: 'developer',
    priceCents: 1000,
    currency: 'USD',
    perks: [
      'publish_one_game',
      'developer_badge',
    ],
  },
  {
    id: 'security',
    priceCents: 2000,
    currency: 'USD',
    perks: [
      'moderate_pending_games',
      'ban_unban_users',
      'security_badge',
    ],
  },
];

router.get(
  '/roles',
  asyncHandler(async (_req, res) => {
    return res.json({ roles: ROLES });
  })
);

const ROLE_RANK = { user: 0, developer: 1, security: 2, admin: 3 };

router.post(
  '/purchase',
  auth,
  express.json(),
  asyncHandler(async (req, res) => {
    const role = String(req.body?.role || '').trim();
    const offer = ROLES.find((r) => r.id === role);
    if (!offer) {
      return res.status(400).json({ message: 'Unknown role' });
    }

    const card = req.body?.card || {};
    const number = String(card.number || '').replace(/\s+/g, '');
    const name = String(card.name || '').trim();
    const expiry = String(card.expiry || '').trim();
    const cvc = String(card.cvc || '').trim();

    if (!/^[0-9]{12,19}$/.test(number)) {
      return res.status(400).json({ message: 'CARD_NUMBER_INVALID' });
    }
    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'CARD_NAME_INVALID' });
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return res.status(400).json({ message: 'CARD_EXPIRY_INVALID' });
    }
    if (!/^[0-9]{3,4}$/.test(cvc)) {
      return res.status(400).json({ message: 'CARD_CVC_INVALID' });
    }

    const currentRank = ROLE_RANK[req.user.role] ?? 0;
    const targetRank = ROLE_RANK[role] ?? 0;
    if (currentRank >= targetRank) {
      return res.status(400).json({ message: 'ROLE_ALREADY_OWNED' });
    }

    const last4 = number.slice(-4);
    await RolePurchase.create({
      userId: req.user._id,
      role,
      priceCents: offer.priceCents,
      currency: offer.currency,
      cardLast4: last4,
      status: 'completed',
      paymentProvider: 'mock',
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role },
      { new: true }
    ).select('-password');

    return res.json({
      ok: true,
      role: user.role,
      receipt: {
        role,
        priceCents: offer.priceCents,
        currency: offer.currency,
        cardLast4: last4,
      },
    });
  })
);

router.get(
  '/purchases',
  auth,
  asyncHandler(async (req, res) => {
    const purchases = await RolePurchase.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json({ purchases });
  })
);

module.exports = router;
