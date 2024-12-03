"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventDispatcher_1 = __importDefault(require("./EventDispatcher"));
const subscriptionService_1 = __importDefault(require("../services/subscriptionService"));
EventDispatcher_1.default.subscribe("PaymentSuccess", async (payload) => {
    await subscriptionService_1.default.handleSubscriptionUpdate(payload.userId, payload.amount, payload.paymentMethod);
});
EventDispatcher_1.default.subscribe("PaymentFailure", async (payload) => {
    await subscriptionService_1.default.handleFailedSubscription(payload.userId);
});
