import { Router } from "express";
import { sendVerificationEmail } from "../controllers/emailController";

const router = Router();

// Define the route for sending a verification email
router.post("/send-verification-email", sendVerificationEmail);

export default router;
