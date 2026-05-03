function roleGuard(...roles) {
  return function guard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Required role: ${roles.join(' or ')}`,
      });
    }
    return next();
  };
}

module.exports = roleGuard;
