import { Router } from "express";
import { createPayment, paypalCapture } from "../controllers/paymentController";
import { validateToken } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/process", validateToken, createPayment);
router.get("/capture", asyncHandler(paypalCapture));

export default router;
