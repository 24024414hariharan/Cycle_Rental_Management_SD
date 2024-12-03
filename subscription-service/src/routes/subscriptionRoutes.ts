import { Router } from "express";
import {
  getSubscriptionStatus,
  updateSubscription,
  handleSubscriptionWebhook,
} from "../controllers/subscriptionController";
import { validateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", validateToken, getSubscriptionStatus);
router.put("/", validateToken, updateSubscription);
router.post("/update-status", validateToken, handleSubscriptionWebhook);

export default router;
