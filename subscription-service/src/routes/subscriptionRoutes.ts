import { Router } from "express";
import {
  getSubscriptionStatus,
  updateSubscription,
} from "../controllers/subscriptionController";
import { validateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", validateToken, getSubscriptionStatus);
router.put("/", validateToken, updateSubscription);

export default router;
