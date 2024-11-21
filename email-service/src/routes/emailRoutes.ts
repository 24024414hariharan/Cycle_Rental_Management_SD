import { Router } from "express";
import { sendVerificationEmail } from "../controllers/emailController";
import { emailRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Define the route for sending a verification email
router.post("/send-verification", emailRateLimiter, sendVerificationEmail);

export default router;
