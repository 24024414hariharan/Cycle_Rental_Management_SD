import { Router } from "express";
import { todoController } from "../controllers/todoController";

const router = Router();

router.get("/tasks", todoController.getTasks);
router.post("/tasks", todoController.addTask);

export default router;
