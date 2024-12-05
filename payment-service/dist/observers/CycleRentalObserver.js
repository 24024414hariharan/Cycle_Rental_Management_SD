"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CycleRentalObserver = void 0;
const paymentUtils_1 = require("../utils/paymentUtils");
class CycleRentalObserver {
    async update(event, paymethod, data) {
        const type = data.type;
        if (type !== "Cycle rental")
            return;
        if (event === "Success" || event === "Failed") {
            const { userId, status, cookies, paymentIntentId, orderId, captureId, rentalID, } = data;
            console.log(`[CycleRentalObserver] Notifying Cycle service for user ${userId}`);
            try {
                if (paymethod === "Stripe") {
                    await (0, paymentUtils_1.handleStripePaymentUpdate)(paymentIntentId, status, userId, cookies, type, rentalID);
                }
                else {
                    await (0, paymentUtils_1.handlePayPalPaymentUpdate)(orderId, status, userId, captureId, cookies, type, rentalID);
                }
            }
            catch (error) {
                console.error(`[CycleRentalObserver] Error notifying cycle service:`, error);
            }
        }
    }
}
exports.CycleRentalObserver = CycleRentalObserver;
