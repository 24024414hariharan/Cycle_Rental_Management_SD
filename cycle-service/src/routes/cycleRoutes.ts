import { Router } from "express";
import { calculateFare } from "../controllers/cycleController";
import { validateToken } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/calculate-fare", validateToken, asyncHandler(calculateFare));

export default router;
