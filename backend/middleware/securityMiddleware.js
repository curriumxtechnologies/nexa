import rateLimit from "express-rate-limit";

// ===== RATE LIMITERS =====

// Global rate limiter for ALL routes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth routes (login, register, forgot password, etc.)
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 attempts per 5 minutes
  message: {
    success: false,
    message: "Too many login attempts, please try again after 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// API-specific limiter for heavy endpoints (search, reports, etc.)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    message: "Rate limit exceeded for this endpoint.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
