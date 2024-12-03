import { Router } from "express";
import paymentRoutes from "./paymentRoutes";

const appRoutes = Router();

appRoutes.use("/payments", paymentRoutes);

export default appRoutes;
