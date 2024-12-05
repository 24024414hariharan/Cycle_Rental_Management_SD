import { Router } from "express";
import aiRoutes from "./aiRoutes";

const appRouter = Router();

appRouter.use("/ai-check", aiRoutes);

export default appRouter;
