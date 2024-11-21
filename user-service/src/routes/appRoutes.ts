import { Router } from "express";
import userRoutes from "./userRoutes";

const appRoutes = Router();
appRoutes.use("/users", userRoutes);

export default appRoutes;
