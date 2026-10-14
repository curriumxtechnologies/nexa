// middleware/securityMiddleware.js
import rateLimit from 'express-rate-limit';

const skipOptions = (req) => req.method === 'OPTIONS';

// ===== GLOBAL =====
// Real SPAs generate a lot of background requests (polling, prefetch,
// multiple slices fetching in parallel). 100/15min is far too low.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,           // 15 minutes
  max: 1000,                          // was 100 → now 1000 per IP per 15 min
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,                  // 👈 don't count / block preflights
  // Trust proxy is set on the app; this makes rate-limit use req.ip safely
  validate: { trustProxy: false, xForwardedForHeader: false },
});

// ===== AUTH =====
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,            // 5 minutes
  max: 30,                            // 30 attempts per IP per 5 min
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 5 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,       // 👈 only count failures (was false)
  skip: skipOptions,                  // 👈 don't count / block preflights
  validate: { trustProxy: false, xForwardedForHeader: false },
});

// ===== PER-ENDPOINT =====
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,                // 1 minute
  max: 120,                           // was 30 → inbox polling alone eats that
  message: {
    success: false,
    message: 'Rate limit exceeded for this endpoint.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,                  // 👈 don't count / block preflights
  validate: { trustProxy: false, xForwardedForHeader: false },
});