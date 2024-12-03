"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
// Configure PayPal environment
const environment = process.env.NODE_ENV === "production"
    ? new checkout_server_sdk_1.default.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new checkout_server_sdk_1.default.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
// Initialize PayPal client
const client = new checkout_server_sdk_1.default.core.PayPalHttpClient(environment);
exports.default = client;
