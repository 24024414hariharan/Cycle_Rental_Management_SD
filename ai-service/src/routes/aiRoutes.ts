import { Router } from "express";
import { sendCycleStatus } from "../controllers/aiController";

const router = Router();

router.post("/status-check", sendCycleStatus);

export default router;
