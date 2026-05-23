import rateLimit from 'express-rate-limit';

export const generationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please retry after the cooling window.',
  },
});
