const jwt = require('jsonwebtoken');

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    secret,
    { expiresIn: '7d' }
  );
}

module.exports = createToken;
