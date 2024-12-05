"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailedState = void 0;
class FailedState {
    async processPayment() {
        throw new Error("Cannot process payment in Failed state.");
    }
    async processRefund() {
        throw new Error("Cannot process refund in Failed state.");
    }
}
exports.FailedState = FailedState;
