"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionObserver = void 0;
const paymentUtils_1 = require("../utils/paymentUtils");
class SubscriptionObserver {
    async update(event, paymethod, data) {
        if (event === "Success" || event === "Failed") {
            const { userId, status, cookies, paymentIntentId, orderId, captureId } = data;
            console.log(`[SubscriptionObserver] Notifying subscription service for user ${userId}`);
            try {
                if (paymethod === "Stripe") {
                    await (0, paymentUtils_1.handleStripePaymentUpdate)(paymentIntentId, status, userId, cookies);
                }
                else {
                    await (0, paymentUtils_1.handlePayPalPaymentUpdate)(orderId, status, userId, captureId, cookies);
                }
            }
            catch (error) {
                console.error(`[SubscriptionObserver] Error notifying subscription service:`, error);
            }
        }
    }
}
exports.SubscriptionObserver = SubscriptionObserver;
