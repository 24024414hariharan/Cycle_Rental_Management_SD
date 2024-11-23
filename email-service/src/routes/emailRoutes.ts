import { Router } from "express";
import { sendVerificationEmail } from "../controllers/emailController";
import { emailRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/send-verification", emailRateLimiter, sendVerificationEmail);

export default router;
