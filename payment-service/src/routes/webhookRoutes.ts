import express from "express";
import { Router } from "express";
import {
  stripeWebhookHandler,
  paypalWebhookHandler,
} from "../controllers/webhookController";
import bodyParser from "body-parser";
import { asyncHandler } from "../utils/asyncHandler";

const webhookRouter = Router();

// Stripe requires the raw body to verify webhook signatures
webhookRouter.post(
  "/stripe",
  bodyParser.raw({ type: "application/json" }),
  asyncHandler(stripeWebhookHandler)
);

webhookRouter.post(
  "/paypal",
  express.json(),
  asyncHandler(paypalWebhookHandler)
);

export default webhookRouter;
