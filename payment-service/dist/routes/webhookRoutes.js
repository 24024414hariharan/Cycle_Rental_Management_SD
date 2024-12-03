"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
const webhookController_1 = require("../controllers/webhookController");
const body_parser_1 = __importDefault(require("body-parser"));
const asyncHandler_1 = require("../utils/asyncHandler");
const webhookRouter = (0, express_2.Router)();
// Stripe requires the raw body to verify webhook signatures
webhookRouter.post("/stripe", body_parser_1.default.raw({ type: "application/json" }), (0, asyncHandler_1.asyncHandler)(webhookController_1.stripeWebhookHandler));
webhookRouter.post("/paypal", express_1.default.json(), (0, asyncHandler_1.asyncHandler)(webhookController_1.paypalWebhookHandler));
exports.default = webhookRouter;
