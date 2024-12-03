"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripePayment = void 0;
const stripeClient_1 = __importDefault(require("../../clients/stripeClient"));
const prisma_1 = __importDefault(require("../../clients/prisma"));
class StripePayment {
    async processPayment(amount, userId, cookies) {
        try {
            // Create a PaymentIntent
            const paymentIntent = await stripeClient_1.default.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe uses cents
                currency: "eur",
                metadata: { userId: userId.toString(), cookies },
                payment_method_types: ["card"],
            });
            console.log("Payment Intent Created:", paymentIntent);
            await prisma_1.default.payment.create({
                data: {
                    userId,
                    method: "Stripe",
                    amount,
                    referenceId: paymentIntent.id,
                    status: "Pending",
                },
            });
            const testToken = "pm_card_visa";
            const confirmedIntent = await stripeClient_1.default.paymentIntents.confirm(paymentIntent.id, { payment_method: testToken });
            console.log("Payment Intent Confirmed:", confirmedIntent);
            return confirmedIntent;
        }
        catch (error) {
            console.error("Error processing payment:", error.message);
            throw new Error("Failed to create and confirm Payment Intent");
        }
    }
    async processRefund(transactionId, amount) {
        try {
            const refund = await stripeClient_1.default.refunds.create({
                payment_intent: transactionId,
                amount: amount ? Math.round(amount * 100) : undefined, // Partial refund
            });
            console.log("Refund created:", refund);
            return refund;
        }
        catch (error) {
            console.error("Error creating Refund:", error.message);
            throw new Error("Failed to create Refund");
        }
    }
}
exports.StripePayment = StripePayment;
