require('dotenv').config();

const mongoose = require('mongoose');

const Game = require('../src/models/Game');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  const targetPrice = Number(process.env.GAMES_DEFAULT_PRICE_UZIS || 10);
  if (!Number.isFinite(targetPrice) || targetPrice < 0) {
    throw new Error('GAMES_DEFAULT_PRICE_UZIS must be a non-negative number');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const before = await Game.countDocuments({});
  const free = await Game.countDocuments({
    $or: [{ priceUzis: { $exists: false } }, { priceUzis: 0 }],
  });

  // eslint-disable-next-line no-console
  console.log(
    `[markGamesPaid] total=${before}, currently free/unset=${free}, target price=⌬${targetPrice}`
  );

  const result = await Game.updateMany(
    { $or: [{ priceUzis: { $exists: false } }, { priceUzis: 0 }] },
    { $set: { priceUzis: targetPrice } }
  );

  // eslint-disable-next-line no-console
  console.log(
    `[markGamesPaid] matched=${result.matchedCount} modified=${result.modifiedCount}`
  );

  await mongoose.disconnect();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exitCode = 1;
});
