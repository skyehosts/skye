import rateLimit from 'express-rate-limit';

export const checkEmailRateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});
