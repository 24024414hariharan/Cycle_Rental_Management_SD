import rateLimit from "express-rate-limit";

export const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login requests per IP
  message: "Too many attempts, please try again after 15 minutes",
});
