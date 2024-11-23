import { Router } from "express";
import cycleRouter from "./cycleRoutes";

const appRouter = Router();

appRouter.use("/cycles", cycleRouter);

export default appRouter;