const express        = require('express');
const bcrypt         = require('bcryptjs');
const jwt            = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit      = require('express-rate-limit');
const AdminUser      = require('../models/AdminUser');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ── Brute-force protection ────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// Shared cookie options — secure + httpOnly in production
const cookieOpts = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  '/login',
  loginLimiter,
  [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;

      // Must explicitly select passwordHash (excluded by default via select:false)
      const admin = await AdminUser.findOne({ email }).select('+passwordHash');

      // Generic error message to prevent user enumeration
      if (!admin) return res.status(401).json({ error: 'Invalid email or password.' });

      const isMatch = await bcrypt.compare(password, admin.passwordHash);
      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

      const token = jwt.sign(
        { id: admin._id, email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, cookieOpts());
      res.json({ success: true, admin: { email: admin.email } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error during login. Please try again.' });
    }
  }
);

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { ...cookieOpts(), maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ── GET /api/auth/me ── verify session ───────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
  res.json({ authenticated: true, admin: { email: req.admin.email } });
});

module.exports = router;
