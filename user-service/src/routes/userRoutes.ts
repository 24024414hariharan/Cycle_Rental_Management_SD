import { Router } from "express";
import { register, login, verifyEmail } from "../controllers/userController";
import { asyncHandler } from "../utils/asyncHandler";
import {
  registerValidator,
  loginValidator,
} from "../validators/userValidators";
import { loginLimiter } from "../middleware/rateLimiter";

const router = Router();

// Register route with validation
router.post("/register", registerValidator, asyncHandler(register));

// Login route with validation and rate limiter
router.post("/login", loginLimiter, loginValidator, asyncHandler(login));

// Email verification route
router.get("/verify-email", asyncHandler(verifyEmail));

export default router;
