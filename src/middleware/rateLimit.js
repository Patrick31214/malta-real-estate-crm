/**
 * Simple in-memory rate limiter middleware.
 * Creates an independent limit counter per (IP, options) combination.
 *
 * @param {object} options
 * @param {number} options.windowMs  - Window duration in milliseconds (default: 60 000)
 * @param {number} options.max       - Max requests per window per IP (default: 100)
 */
function rateLimit({ windowMs = 60 * 1000, max = 100 } = {}) {
  const store = new Map();

  // Periodically prune stale entries so the Map does not grow unboundedly
  const pruneInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, windowMs);
  // Allow Node to exit cleanly even if the interval is still scheduled
  if (pruneInterval.unref) pruneInterval.unref();

  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
    const now = Date.now();
    let entry = store.get(ip);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
    }
    entry.count += 1;
    store.set(ip, entry);
    if (entry.count > max) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
    }
    next();
  };
}

module.exports = rateLimit;
