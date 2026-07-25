const express         = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit       = require('express-rate-limit');
const Lead            = require('../models/Lead');
const authMiddleware  = require('../middleware/authMiddleware');
const { sendLeadEmail } = require('../services/mailer');

const router = express.Router();

// ── Rate limiter for public form submissions ──────────────────────────────────
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please wait 15 minutes and try again.' },
});

// ── Validation rules ─────────────────────────────────────────────────────────
const leadValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+\d\s\-().]{7,25}$/).withMessage('Please enter a valid phone number'),
  body('budgetRange')
    .isIn(['Under $1,000', '$1,000 – $5,000', '$5,000 – $20,000', '$20,000+'])
    .withMessage('Please select a valid budget range'),
  body('message')
    .trim()
    .notEmpty().withMessage('Please tell us about your project')
    .isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2,000 characters'),
];

// ── POST /api/leads ── PUBLIC ─────────────────────────────────────────────────
router.post('/', submitLimiter, leadValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return a field-keyed object so the client can display inline errors
    const fields = errors.array().reduce((acc, e) => {
      acc[e.path] = e.msg;
      return acc;
    }, {});
    return res.status(400).json({ error: 'Validation failed', fields });
  }

  try {
    const { name, email, budgetRange, message, phone } = req.body;
    const lead = await Lead.create({ name, email, budgetRange, message, phone });
    res.status(201).json({
      success: true,
      message: "We've received your inquiry. Our team will be in touch within 24 hours!",
      id: lead._id,
    });
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/leads ── ADMIN ONLY ──────────────────────────────────────────────
// Supports ?search=<text> and ?status=<New|Contacted|Closed|All>
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;

    if (search && search.trim()) {
      const re = { $regex: search.trim(), $options: 'i' };
      filter.$or = [{ name: re }, { email: re }, { message: re }];
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });

    // ── Aggregated stats (always calculated on the full collection) ──────────
    const [statusAgg, budgetAgg] = await Promise.all([
      Lead.aggregate([{ $group: { _id: '$status',      count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$budgetRange', count: { $sum: 1 } } }]),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await Lead.countDocuments({ createdAt: { $gte: todayStart } });
    const totalCount = await Lead.countDocuments({});

    res.json({
      leads,
      stats: {
        total:    totalCount,
        today:    todayCount,
        byStatus: statusAgg,
        byBudget: budgetAgg,
      },
    });
  } catch (err) {
    console.error('Fetch leads error:', err);
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});

// ── PATCH /api/leads/:id/status ── ADMIN ONLY ─────────────────────────────────
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const valid = ['New', 'Contacted', 'Closed'];

  if (!valid.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${valid.join(', ')}` });
  }

  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) return res.status(404).json({ error: 'Lead not found.' });

    res.json({ success: true, lead });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// ── POST /api/leads/:id/message ── ADMIN ONLY ─────────────────────────
// Sends a message to the lead via email (Nodemailer) or logs a WhatsApp contact.
// Stores every message in the lead's messages[] history array.
router.post('/:id/message', authMiddleware, async (req, res) => {
  const { message, channel } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }
  if (!['email', 'whatsapp'].includes(channel)) {
    return res.status(400).json({ error: 'Channel must be \'email\' or \'whatsapp\'.' });
  }

  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });

    if (channel === 'email') {
      // Will throw if GMAIL_USER / GMAIL_PASS are missing
      await sendLeadEmail({ toEmail: lead.email, toName: lead.name, message: message.trim() });
    }
    // WhatsApp is opened directly in the browser — we just log it here

    // Persist message in lead history
    lead.messages.push({ text: message.trim(), channel, sentAt: new Date() });
    // Auto-advance status to Contacted when admin first reaches out
    if (lead.status === 'New') lead.status = 'Contacted';
    await lead.save();

    res.json({
      success: true,
      message: channel === 'email' ? 'Email sent successfully!' : 'WhatsApp message logged.',
      lead,
    });
  } catch (err) {
    console.error('Send message error:', err.message);
    // Surface config errors clearly
    if (err.message.includes('GMAIL_USER')) {
      return res.status(503).json({
        error: 'Email not configured on server. Add GMAIL_USER and GMAIL_PASS to server/.env (see README).',
      });
    }
    res.status(500).json({ error: err.message || 'Failed to send message.' });
  }
});

module.exports = router;
