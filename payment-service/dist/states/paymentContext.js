"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pendingState_1 = require("./pendingState");
class PaymentContext {
    constructor(paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
        this.state = new pendingState_1.PendingState(); // Initial state
    }
    setState(state) {
        console.log(`[PaymentContext] State transitioned to: ${state.constructor.name}`);
        this.state = state;
    }
    async processPayment(amount, userId, cookies, type) {
        return this.state.processPayment(this, amount, userId, cookies, type);
    }
    async processRefund(transactionId, amount) {
        return this.state.processRefund(this, transactionId, amount);
    }
}
exports.default = PaymentContext;
