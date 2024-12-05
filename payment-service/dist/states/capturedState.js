"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapturedState = void 0;
class CapturedState {
    async processPayment() {
        throw new Error("Payment is already captured.");
    }
    async processRefund() {
        throw new Error("Cannot process refund in Captured state.");
    }
}
exports.CapturedState = CapturedState;
