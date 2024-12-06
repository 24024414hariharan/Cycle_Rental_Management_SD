import rateLimit from "express-rate-limit";

export const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many attempts, please try again after 15 minutes",
});
