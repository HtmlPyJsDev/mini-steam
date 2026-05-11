const express = require('express');

const RolePurchase = require('../models/RolePurchase');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const uzisService = require('../services/uzis');

const router = express.Router();

const TG_HANDLE = (process.env.SHOP_TELEGRAM_HANDLE || 'DevoloperUI').replace(/^@/, '');

// 1 USD = 90 RUB rough peg used purely for display in the shop.
const USD_TO_RUB = 90;

const ROLES = [
  {
    id: 'developer',
    priceCents: 1000,
    currency: 'USD',
    perks: ['publish_one_game', 'developer_badge'],
  },
  {
    id: 'security',
    priceCents: 2000,
    currency: 'USD',
    perks: ['moderate_pending_games', 'ban_unban_users', 'security_badge'],
  },
];

const ROLE_RANK = { user: 0, developer: 1, security: 2, admin: 3 };

function decorate(role) {
  const usd = role.priceCents / 100;
  const rub = Math.round(usd * USD_TO_RUB);
  const uzis = uzisService.ROLE_COSTS[role.id] ?? null;
  return {
    ...role,
    priceUsd: usd,
    priceRub: rub,
    priceUzis: uzis,
  };
}

router.get(
  '/roles',
  asyncHandler(async (_req, res) => {
    return res.json({
      roles: ROLES.map(decorate),
      contact: {
        provider: 'telegram',
        handle: TG_HANDLE,
        url: `https://t.me/${TG_HANDLE}`,
      },
    });
  })
);

router.post(
  '/request',
  auth,
  express.json(),
  asyncHandler(async (req, res) => {
    const role = String(req.body?.role || '').trim();
    const offer = ROLES.find((r) => r.id === role);
    if (!offer) return res.status(400).json({ message: 'Unknown role' });

    const currentRank = ROLE_RANK[req.user.role] ?? 0;
    const targetRank = ROLE_RANK[role] ?? 0;
    if (currentRank >= targetRank) {
      return res.status(400).json({ message: 'ROLE_ALREADY_OWNED' });
    }

    const existing = await RolePurchase.findOne({
      userId: req.user._id,
      role,
      status: 'requested',
    });
    if (existing) {
      return res.status(409).json({ message: 'REQUEST_ALREADY_PENDING' });
    }

    const note = String(req.body?.note || '').slice(0, 500);

    const purchase = await RolePurchase.create({
      userId: req.user._id,
      role,
      priceCents: offer.priceCents,
      currency: offer.currency,
      status: 'requested',
      paymentProvider: 'telegram',
      contactHandle: TG_HANDLE,
      note,
    });

    return res.status(201).json({ purchase });
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
