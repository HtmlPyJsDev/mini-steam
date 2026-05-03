const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server is not configured (JWT_SECRET missing)' });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = auth;
