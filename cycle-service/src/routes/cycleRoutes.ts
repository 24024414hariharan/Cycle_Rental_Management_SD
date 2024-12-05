import { Router } from "express";
import {
  calculateFare,
  addCycleModel,
  addCycle,
  getAllCycles,
  getCycleModels,
  getRentalDetails,
  handleSubscriptionWebhook,
} from "../controllers/cycleController";
import { validateToken } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/add-cyclemodel",
  validateToken,
  authorizeRoles(["ADMIN"]),
  asyncHandler(addCycleModel)
);

router.post(
  "/add-cycle",
  validateToken,
  authorizeRoles(["ADMIN"]),
  asyncHandler(addCycle)
);

router.get("/get-cyclemodel", validateToken, asyncHandler(getCycleModels));

router.get("/get-allcycles", validateToken, asyncHandler(getAllCycles));

router.post("/calculate-fare", validateToken, asyncHandler(calculateFare));

router.get("/rental/:rentalId", validateToken, asyncHandler(getRentalDetails));

router.post("/update-status", validateToken, handleSubscriptionWebhook);

export default router;
