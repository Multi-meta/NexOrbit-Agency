require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const leadsRouter = require('./routes/leads');
const authRouter = require('./routes/auth');

const app = express();

// Trust proxy — required for Render / Railway deployments
app.set('trust proxy', 1);

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow curl / Postman (no origin header) or listed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: Origin "${origin}" is not allowed`));
    },
    credentials: true,
  })
);

// ── Body / cookie parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/leads', leadsRouter);
app.use('/api/auth', authRouter);

// Health check (used by Render to verify the service is alive)
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 404 catch-all
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Connect to MongoDB → start server ────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, { dbName: 'leaddesk' })
  .then(() => {
    console.log('✅  Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀  Server running on port ${PORT}  [${process.env.NODE_ENV || 'development'}]`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
