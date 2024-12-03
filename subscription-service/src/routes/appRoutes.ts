import { Router } from "express";
import subscriptionRoutes from "./subscriptionRoutes";

const appRouter = Router();

appRouter.use("/subscription", subscriptionRoutes);

export default appRouter;