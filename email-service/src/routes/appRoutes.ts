import { Router } from "express";
import emailRoutes from "./emailRoutes";

const appRouter = Router();

appRouter.use("/email", emailRoutes);

export default appRouter;
