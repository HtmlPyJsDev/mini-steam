const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const UzisLedger = require('../models/UzisLedger');
const Contest = require('../models/Contest');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncHandler = require('../utils/asyncHandler');
const uzisService = require('../services/uzis');

const router = express.Router();

const PUBLIC_FIELDS = 'email role displayName avatarUrl uzis';

function asId(s) {
  if (!mongoose.Types.ObjectId.isValid(s)) return null;
  return new mongoose.Types.ObjectId(s);
}

function publicUser(u) {
  if (!u) return null;
  const obj = u.toObject ? u.toObject() : u;
  return {
    _id: obj._id,
    email: obj.email,
    role: obj.role,
    displayName: obj.displayName || '',
    avatarUrl: obj.avatarUrl || '',
    uzis: obj.uzis || 0,
  };
}

function publicContest(c, viewer) {
  if (!c) return null;
  const obj = c.toObject ? c.toObject() : c;
  const participants = (obj.participants || []).map((p) => p.toString());
  const winners = (obj.winners || []).map((p) => p.toString());
  const me = viewer ? viewer._id.toString() : null;
  return {
    _id: obj._id,
    title: obj.title,
    description: obj.description || '',
    prize: obj.prize,
    creatorId: obj.creatorId,
    endsAt: obj.endsAt,
    status: obj.status,
    participantsCount: participants.length,
    winnersCount: winners.length,
    isParticipant: me ? participants.includes(me) : false,
    isWinner: me ? winners.includes(me) : false,
    createdAt: obj.createdAt,
  };
}

// ===== Balance & ledger =====
router.get(
  '/balance',
  auth,
  asyncHandler(async (req, res) => {
    return res.json({
      uzis: req.user.uzis || 0,
      dailyEarned: req.user.uzisDailyEarned || 0,
      dailyCap: uzisService.PRESENCE_DAILY_CAP,
      tickMinutes: uzisService.PRESENCE_TICK_MINUTES,
      tickReward: uzisService.PRESENCE_TICK_REWARD,
      reviewReward: uzisService.REVIEW_REWARD,
      roleCosts: uzisService.ROLE_COSTS,
    });
  })
);

router.get(
  '/ledger',
  auth,
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const entries = await UzisLedger.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return res.json({ entries });
  })
);

// ===== Shop with Uzis =====
router.post(
  '/shop/buy',
  auth,
  asyncHandler(async (req, res) => {
    const { role } = req.body || {};
    if (!role || !uzisService.ROLE_COSTS[role]) {
      return res.status(400).json({ message: 'Unknown role', code: 'UNKNOWN_ROLE' });
    }
    if (req.user.role === 'admin') {
      return res.status(400).json({ message: 'Admins already have everything', code: 'ROLE_ALREADY_OWNED' });
    }
    if (role === 'developer' && (req.user.role === 'developer' || req.user.role === 'security')) {
      return res.status(400).json({ message: 'You already have this or a higher role', code: 'ROLE_ALREADY_OWNED' });
    }
    if (role === 'security' && req.user.role === 'security') {
      return res.status(400).json({ message: 'You already have this role', code: 'ROLE_ALREADY_OWNED' });
    }
    const cost = uzisService.ROLE_COSTS[role];
    if ((req.user.uzis || 0) < cost) {
      return res
        .status(400)
        .json({ message: 'Not enough uzis', code: 'INSUFFICIENT_UZIS', need: cost });
    }
    try {
      await uzisService.debit(req.user, cost, `shop_role_${role}`, {
        note: `Bought role: ${role}`,
      });
    } catch (err) {
      if (err.code === 'INSUFFICIENT_UZIS') {
        return res.status(400).json({ message: 'Not enough uzis', code: 'INSUFFICIENT_UZIS' });
      }
      throw err;
    }
    req.user.role = role;
    await req.user.save();
    return res.json({
      ok: true,
      role,
      uzis: req.user.uzis,
      user: req.user.toSafeJSON(),
    });
  })
);

// ===== Admin: grant Uzis =====
router.post(
  '/admin/grant',
  auth,
  admin,
  asyncHandler(async (req, res) => {
    const { userId, amount, note } = req.body || {};
    const id = asId(userId);
    if (!id) return res.status(400).json({ message: 'Invalid userId' });
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt === 0 || amt < -100000 || amt > 100000) {
      return res.status(400).json({ message: 'Amount must be a non-zero number up to ±100000' });
    }
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (amt > 0) {
      await uzisService.credit(target, amt, 'admin_grant', {
        note: note || '',
        actorId: req.user._id,
      });
    } else {
      try {
        await uzisService.debit(target, -amt, 'admin_deduct', {
          note: note || '',
          actorId: req.user._id,
        });
      } catch (err) {
        if (err.code === 'INSUFFICIENT_UZIS') {
          return res
            .status(400)
            .json({ message: 'User does not have enough uzis to deduct', code: 'INSUFFICIENT_UZIS' });
        }
        throw err;
      }
    }
    return res.json({ ok: true, user: publicUser(target) });
  })
);

router.get(
  '/admin/recent',
  auth,
  admin,
  asyncHandler(async (_req, res) => {
    const entries = await UzisLedger.find({})
      .sort({ createdAt: -1 })
      .limit(60)
      .populate('userId', 'email displayName avatarUrl')
      .populate('actorId', 'email displayName')
      .lean();
    return res.json({ entries });
  })
);

// ===== Contests =====
router.get(
  '/contests',
  auth,
  asyncHandler(async (req, res) => {
    const status = req.query.status === 'closed' ? 'closed' : 'active';
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const sortOrder = status === 'active' ? { endsAt: 1 } : { createdAt: -1 };
    const contests = await Contest.find({ status })
      .sort(sortOrder)
      .limit(limit)
      .lean();
    return res.json({ contests: contests.map((c) => publicContest(c, req.user)) });
  })
);

router.get(
  '/contests/:id',
  auth,
  asyncHandler(async (req, res) => {
    const id = asId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const contest = await Contest.findById(id)
      .populate('participants', PUBLIC_FIELDS)
      .populate('winners', PUBLIC_FIELDS)
      .populate('creatorId', 'email displayName avatarUrl');
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    return res.json({
      contest: {
        ...publicContest(contest, req.user),
        participants: (contest.participants || []).map(publicUser),
        winners: (contest.winners || []).map(publicUser),
        creator: contest.creatorId ? publicUser(contest.creatorId) : null,
      },
    });
  })
);

router.post(
  '/contests',
  auth,
  admin,
  asyncHandler(async (req, res) => {
    const { title, description, prize, endsAt } = req.body || {};
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const prizeAmount = Number(prize);
    if (!Number.isFinite(prizeAmount) || prizeAmount < 1 || prizeAmount > 1000000) {
      return res.status(400).json({ message: 'Prize must be between 1 and 1,000,000' });
    }
    const endTime = new Date(endsAt);
    if (Number.isNaN(endTime.getTime()) || endTime.getTime() < Date.now() + 60 * 1000) {
      return res
        .status(400)
        .json({ message: 'endsAt must be a valid date at least 1 minute in the future' });
    }
    const contest = await Contest.create({
      title: title.trim().slice(0, 120),
      description: (description || '').toString().slice(0, 2000),
      prize: Math.floor(prizeAmount),
      creatorId: req.user._id,
      endsAt: endTime,
      participants: [],
      winners: [],
      status: 'active',
    });
    return res.status(201).json({ contest: publicContest(contest, req.user) });
  })
);

router.post(
  '/contests/:id/join',
  auth,
  asyncHandler(async (req, res) => {
    const id = asId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (contest.status !== 'active') {
      return res.status(400).json({ message: 'Contest is not active' });
    }
    if (new Date(contest.endsAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'Contest already ended' });
    }
    const meId = req.user._id.toString();
    const exists = (contest.participants || []).some((p) => p.toString() === meId);
    if (!exists) {
      contest.participants.push(req.user._id);
      await contest.save();
    }
    return res.json({ ok: true, contest: publicContest(contest, req.user) });
  })
);

router.post(
  '/contests/:id/leave',
  auth,
  asyncHandler(async (req, res) => {
    const id = asId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (contest.status !== 'active') {
      return res.status(400).json({ message: 'Contest is not active' });
    }
    const meId = req.user._id.toString();
    contest.participants = (contest.participants || []).filter((p) => p.toString() !== meId);
    await contest.save();
    return res.json({ ok: true, contest: publicContest(contest, req.user) });
  })
);

router.post(
  '/contests/:id/award',
  auth,
  admin,
  asyncHandler(async (req, res) => {
    const id = asId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const { winnerIds } = req.body || {};
    if (!Array.isArray(winnerIds) || winnerIds.length === 0) {
      return res.status(400).json({ message: 'winnerIds array is required' });
    }
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (contest.status === 'closed') {
      return res.status(400).json({ message: 'Contest already closed' });
    }
    const participantSet = new Set(
      (contest.participants || []).map((p) => p.toString())
    );
    const winners = [];
    for (const wid of winnerIds) {
      if (typeof wid !== 'string' || !mongoose.Types.ObjectId.isValid(wid)) continue;
      if (!participantSet.has(wid)) continue;
      winners.push(wid);
    }
    if (winners.length === 0) {
      return res.status(400).json({ message: 'Winners must be among participants' });
    }
    const sharePerWinner = Math.floor(contest.prize / winners.length);
    if (sharePerWinner < 1) {
      return res.status(400).json({ message: 'Prize too small to split' });
    }
    for (const wid of winners) {
      const winnerUser = await User.findById(wid);
      if (!winnerUser) continue;
      await uzisService.credit(winnerUser, sharePerWinner, 'contest_prize', {
        note: `Contest: ${contest.title}`,
        refId: contest._id,
        actorId: req.user._id,
      });
    }
    contest.winners = winners.map((w) => new mongoose.Types.ObjectId(w));
    contest.status = 'closed';
    await contest.save();
    return res.json({ ok: true, contest: publicContest(contest, req.user), share: sharePerWinner });
  })
);

router.delete(
  '/contests/:id',
  auth,
  admin,
  asyncHandler(async (req, res) => {
    const id = asId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (contest.status === 'closed') {
      return res.status(400).json({ message: 'Cannot delete a closed contest' });
    }
    await Contest.deleteOne({ _id: contest._id });
    return res.json({ ok: true });
  })
);

module.exports = router;
