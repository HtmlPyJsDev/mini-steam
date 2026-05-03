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
const errorHandler = require('./src/middleware/errorHandler');
const auth = require('./src/middleware/auth');

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
app.use('/api/admin', adminRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

(async () => {
  try {
    await connectDB();
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
