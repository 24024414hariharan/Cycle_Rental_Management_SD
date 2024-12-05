"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingState = void 0;
const approvedState_1 = require("./approvedState"); // Import ApprovedState
class PendingState {
    async processPayment(context, amount, userId, cookies, type) {
        console.log("[PendingState] Processing payment...");
        const response = await context.paymentStrategy.processPayment(amount, userId, cookies, type);
        context.setState(new approvedState_1.ApprovedState());
        return response;
    }
    async processRefund(context, transactionId, amount) {
        throw new Error("Cannot process refund in Pending state.");
    }
}
exports.PendingState = PendingState;
