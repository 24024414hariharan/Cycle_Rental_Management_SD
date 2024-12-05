"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovedState = void 0;
class ApprovedState {
    async processPayment() {
        throw new Error("Payment is already approved.");
    }
    async processRefund(context, transactionId, amount) {
        console.log("[ApprovedState] Processing refund...");
        const response = await context.paymentStrategy.processRefund(transactionId, amount);
        // Transition to another state if necessary
        return response;
    }
}
exports.ApprovedState = ApprovedState;
