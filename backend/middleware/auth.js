const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // support tokens signed with either { id } or { userId }
    const userId = decoded.id || decoded.userId || decoded.user_id || decoded.sub;
    req.user = await User.findById(userId).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

const adminOrLandlord = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'landlord')) {
    return next();
  }
  return res.status(403).json({ message: 'Admin or landlord access required' });
};

module.exports = { protect, adminOnly, adminOrLandlord };
