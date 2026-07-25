const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT stored in the request's httpOnly cookie.
 * Attaches decoded payload ({ id, email }) to req.admin on success.
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Please log in to continue.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid session. Please log in again.';
    return res.status(401).json({ error: message });
  }
};

module.exports = authMiddleware;
