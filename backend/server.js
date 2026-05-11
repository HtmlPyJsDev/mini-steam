require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const captchaRoutes = require('./src/routes/captchaRoutes');
const meRoutes = require('./src/routes/meRoutes');
const userRoutes = require('./src/routes/userRoutes');
const friendsRoutes = require('./src/routes/friendsRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const developerRoutes = require('./src/routes/developerRoutes');
const shopRoutes = require('./src/routes/shopRoutes');
const socialRoutes = require('./src/routes/socialRoutes');
const uzisRoutes = require('./src/routes/uzisRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const auth = require('./src/middleware/auth');
const Game = require('./src/models/Game');

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mini-steam-backend' });
});

app.use('/api', authRoutes);
app.use('/api/captcha', captchaRoutes);
app.get('/api/download/:id', auth, gameRoutes.downloadHandler);
app.use('/api/games', gameRoutes);
app.use('/api/me', meRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/uzis', uzisRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

// Idempotent: every game published before priceUzis existed gets the
// default of 10 uzis. Games published after that already have an explicit
// priceUzis (0 for free, 10 for paid) so this updateMany is a no-op for
// them.
async function backfillGamePrices() {
  try {
    const result = await Game.updateMany(
      { priceUzis: { $exists: false } },
      { $set: { priceUzis: 10 } }
    );
    if (result.modifiedCount > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `[mini-steam] Backfilled priceUzis=10 on ${result.modifiedCount} legacy games`
      );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[mini-steam] Failed to backfill game prices:', err.message);
  }
}

(async () => {
  try {
    await connectDB();
    await backfillGamePrices();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[mini-steam] Backend listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mini-steam] Failed to start backend:', err);
    process.exit(1);
  }
})();
