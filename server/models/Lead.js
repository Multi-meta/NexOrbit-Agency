const mongoose = require('mongoose');

const BUDGET_RANGES = ['Under $1,000', '$1,000 – $5,000', '$5,000 – $20,000', '$20,000+'];
const STATUSES     = ['New', 'Contacted', 'Closed'];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    // Optional — used for WhatsApp outreach from admin dashboard
    phone: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (v) => !v || /^[+\d\s\-().]{7,25}$/.test(v),
        message: 'Please enter a valid phone number',
      },
    },
    budgetRange: {
      type: String,
      required: [true, 'Budget range is required'],
      enum: { values: BUDGET_RANGES, message: 'Invalid budget range selected' },
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message cannot exceed 2,000 characters'],
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Invalid status value' },
      default: 'New',
    },
    // Stores every message the admin sends to this lead (email or WhatsApp)
    messages: [
      {
        text:    { type: String, required: true },
        channel: { type: String, enum: ['email', 'whatsapp'], required: true },
        sentAt:  { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

leadSchema.index({ name: 'text', email: 'text', message: 'text' });
leadSchema.index({ status: 1, createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
module.exports.BUDGET_RANGES = BUDGET_RANGES;
module.exports.STATUSES = STATUSES;
