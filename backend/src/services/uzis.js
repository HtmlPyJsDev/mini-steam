const User = require('../models/User');
const UzisLedger = require('../models/UzisLedger');

const PRESENCE_TICK_MINUTES = 10;
const PRESENCE_TICK_REWARD = 10;
const PRESENCE_DAILY_CAP = 200;
const REVIEW_REWARD = 25;

const ROLE_COSTS = {
  developer: 500,
  security: 1000,
};

function todayKey(now = new Date()) {
  return new Date(now).toISOString().slice(0, 10);
}

async function logEntry({ userId, delta, balanceAfter, reason, note, refId, actorId }) {
  await UzisLedger.create({
    userId,
    delta,
    balanceAfter,
    reason,
    note: note || '',
    refId: refId || null,
    actorId: actorId || null,
  });
}

async function credit(user, amount, reason, opts = {}) {
  if (!user || !amount || amount <= 0) return user;
  user.uzis = (user.uzis || 0) + amount;
  await user.save();
  await logEntry({
    userId: user._id,
    delta: amount,
    balanceAfter: user.uzis,
    reason,
    note: opts.note,
    refId: opts.refId,
    actorId: opts.actorId,
  });
  return user;
}

async function debit(user, amount, reason, opts = {}) {
  if (!user || !amount || amount <= 0) return user;
  if ((user.uzis || 0) < amount) {
    const err = new Error('INSUFFICIENT_UZIS');
    err.code = 'INSUFFICIENT_UZIS';
    err.status = 400;
    throw err;
  }
  user.uzis = user.uzis - amount;
  await user.save();
  await logEntry({
    userId: user._id,
    delta: -amount,
    balanceAfter: user.uzis,
    reason,
    note: opts.note,
    refId: opts.refId,
    actorId: opts.actorId,
  });
  return user;
}

// Award uzis based on time spent on site (called from heartbeat).
// Awards in 10-minute chunks; daily cap = 200. Mutates and saves user.
async function maybeAccruePresence(user) {
  if (!user) return { gained: 0, capped: false };
  const now = new Date();
  const today = todayKey(now);
  if (user.uzisDailyDate !== today) {
    user.uzisDailyDate = today;
    user.uzisDailyEarned = 0;
  }
  if (!user.uzisLastTickAt) {
    user.uzisLastTickAt = now;
    await user.save();
    return { gained: 0, capped: false };
  }
  const elapsedMs = now.getTime() - new Date(user.uzisLastTickAt).getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  if (elapsedMinutes < PRESENCE_TICK_MINUTES) {
    return { gained: 0, capped: false };
  }
  const ticks = Math.floor(elapsedMinutes / PRESENCE_TICK_MINUTES);
  let reward = ticks * PRESENCE_TICK_REWARD;
  const remaining = Math.max(0, PRESENCE_DAILY_CAP - (user.uzisDailyEarned || 0));
  let capped = false;
  if (reward > remaining) {
    reward = remaining;
    capped = true;
  }
  user.uzisLastTickAt = new Date(
    new Date(user.uzisLastTickAt).getTime() + ticks * PRESENCE_TICK_MINUTES * 60000
  );
  if (reward <= 0) {
    await user.save();
    return { gained: 0, capped };
  }
  user.uzisDailyEarned = (user.uzisDailyEarned || 0) + reward;
  user.uzis = (user.uzis || 0) + reward;
  await user.save();
  await logEntry({
    userId: user._id,
    delta: reward,
    balanceAfter: user.uzis,
    reason: 'presence',
    note: `+${reward} uzis for ~${ticks * PRESENCE_TICK_MINUTES} minutes online`,
  });
  return { gained: reward, capped };
}

module.exports = {
  credit,
  debit,
  maybeAccruePresence,
  ROLE_COSTS,
  PRESENCE_TICK_MINUTES,
  PRESENCE_TICK_REWARD,
  PRESENCE_DAILY_CAP,
  REVIEW_REWARD,
};
