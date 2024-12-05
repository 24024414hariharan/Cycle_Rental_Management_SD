"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePayPalPaymentUpdate = exports.handleStripePaymentUpdate = void 0;
const prisma_1 = __importDefault(require("../clients/prisma"));
const axios_1 = __importDefault(require("axios"));
const subscriptionServiceUrl = `${process.env.SUBSCRIPTION_SERVICE_URL}/api/subscription/update-status`;
const cycleServiceUrl = `${process.env.Cycle_SERVICE_URL}/api/cycles/update-status`;
// Stripe-specific payment update handler
const handleStripePaymentUpdate = async (referenceId, status, userId, cookies, type, rentalID) => {
    try {
        console.log("Stripe payment update received:", {
            referenceId,
            status,
            userId,
            rentalID,
        });
        // Check if the payment exists
        const paymentRecord = await prisma_1.default.payment.findUnique({
            where: { referenceId },
        });
        if (!paymentRecord) {
            console.error("Stripe payment record not found:", { referenceId });
            throw new Error("Payment record not found.");
        }
        // Update payment status
        await prisma_1.default.payment.update({
            where: { referenceId },
            data: { status },
        });
        console.log(`Stripe payment ${status.toLowerCase()} for userId: ${userId}`);
        if (type === "Subscription") {
            await notifySubscriptionService(userId, status, cookies);
        }
        else {
            if (rentalID !== undefined) {
                await notifyCycleService(userId, status, cookies, rentalID);
            }
        }
    }
    catch (err) {
        console.error(`Error updating Stripe payment: ${err.message}`);
        throw new Error("Failed to handle Stripe payment update.");
    }
};
exports.handleStripePaymentUpdate = handleStripePaymentUpdate;
// PayPal-specific payment update handler
const handlePayPalPaymentUpdate = async (referenceId, status, userId, captureId, cookies, type, rentalID) => {
    try {
        console.log("PayPal payment update received:", {
            referenceId,
            status,
            userId,
            captureId,
        });
        // Find the payment record by orderId
        const paymentRecord = await prisma_1.default.payment.findUnique({
            where: { referenceId },
        });
        if (!paymentRecord) {
            console.error("PayPal payment record not found:", { referenceId });
            throw new Error("Payment record not found.");
        }
        // Update the record with captureId and status
        await prisma_1.default.payment.update({
            where: { referenceId },
            data: {
                captureId,
                status,
            },
        });
        console.log(`PayPal payment ${status.toLowerCase()} for userId: ${userId}`);
        if (type === "Subscription") {
            await notifySubscriptionService(userId, status, cookies);
        }
        else {
            if (rentalID !== undefined) {
                await notifyCycleService(userId, status, cookies, rentalID);
            }
        }
    }
    catch (err) {
        console.error(`Error updating PayPal payment: ${err.message}`);
        throw new Error("Failed to handle PayPal payment update.");
    }
};
exports.handlePayPalPaymentUpdate = handlePayPalPaymentUpdate;
// Notify the subscription service
const notifySubscriptionService = async (userId, status, cookies) => {
    try {
        await axios_1.default.post(subscriptionServiceUrl, {
            userId: parseInt(userId, 10),
            status,
        }, {
            headers: {
                "Content-Type": "application/json",
                cookie: cookies,
            },
        });
    }
    catch (err) {
        console.error(`Error notifying subscription service: ${err.message}`);
        throw new Error("Failed to notify subscription service.");
    }
};
const notifyCycleService = async (userId, status, cookies, rentalID) => {
    try {
        await axios_1.default.post(cycleServiceUrl, {
            userId: parseInt(userId, 10),
            status,
            rentalID: parseInt(rentalID, 10),
        }, {
            headers: {
                "Content-Type": "application/json",
                cookie: cookies,
            },
        });
    }
    catch (err) {
        console.error(`Error notifying Cycle service: ${err.message}`);
        throw new Error("Failed to notify Cycle service.");
    }
};
