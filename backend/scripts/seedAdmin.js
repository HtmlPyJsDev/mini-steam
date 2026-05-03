require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../src/models/User');

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const uri = process.env.MONGODB_URI;

  if (!uri) throw new Error('MONGODB_URI is not set');
  if (!email) throw new Error('ADMIN_EMAIL is not set');
  if (!password || password.length < 6) {
    throw new Error('ADMIN_PASSWORD must be set and be at least 6 characters long');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  let user = await User.findOne({ email });

  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    user = await User.create({ email, password: hash, role: 'admin' });
    // eslint-disable-next-line no-console
    console.log(`[seed:admin] Created admin user ${email}`);
  } else {
    user.role = 'admin';
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    // eslint-disable-next-line no-console
    console.log(`[seed:admin] Updated existing user ${email} -> role=admin and reset password`);
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('[seed:admin] Failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
