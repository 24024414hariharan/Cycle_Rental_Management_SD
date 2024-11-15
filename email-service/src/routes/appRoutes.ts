import { Router } from "express";
import emailRoutes from "./emailRoutes";

const appRouter = Router();

// Mount email routes
appRouter.use("/email", emailRoutes);

// Add other route groups here if needed
export default appRouter;
