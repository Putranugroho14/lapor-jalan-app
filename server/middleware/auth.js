const jwt = require('jsonwebtoken');

// JWT secret from environment variable. MUST be set in production via env vars.
// The fallback is intentionally weak and only for local development convenience.
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_do_not_use_in_production';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET environment variable is not set in production!');
  process.exit(1);
}

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat melakukan tindakan ini.' });
  }
  next();
};

module.exports = { authenticateToken, authorizeAdmin, JWT_SECRET };