"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stripePayment_1 = require("./strategies/stripePayment"); // Import StripePayment
const paypalPayment_1 = require("./strategies/paypalPayment"); // Import PayPalPayment
class PaymentService {
    constructor(paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }
    async processPayment(userId, amount, cookies) {
        const paymentResponse = await this.paymentStrategy.processPayment(amount, userId, cookies);
        const method = this.paymentStrategy instanceof stripePayment_1.StripePayment
            ? "Stripe"
            : this.paymentStrategy instanceof paypalPayment_1.PayPalPayment
                ? "PayPal"
                : "Unknown";
        return paymentResponse;
    }
    async processRefund(transactionId, amount) {
        return await this.paymentStrategy.processRefund(transactionId, amount);
    }
}
exports.default = PaymentService;
