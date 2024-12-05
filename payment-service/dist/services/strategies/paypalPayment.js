"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalPayment = void 0;
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
const paypalClient_1 = __importDefault(require("../../clients/paypalClient")); // PayPal client instance
const prisma_1 = __importDefault(require("../../clients/prisma")); // Database client for storing payment info
class PayPalPayment {
    /**
     * Process payment by creating an order with CAPTURE intent.
     */
    async processPayment(amount, userId, cookies, type, rentalID) {
        if (amount <= 0) {
            throw new Error("Invalid amount. Payment amount must be greater than zero.");
        }
        const request = new checkout_server_sdk_1.default.orders.OrdersCreateRequest();
        request.requestBody({
            intent: "CAPTURE", // Directly create an order with CAPTURE intent
            purchase_units: [
                {
                    amount: { value: amount.toFixed(2), currency_code: "EUR" }, // Euros
                    custom_id: JSON.stringify({
                        userId,
                        metadata: { cookies },
                        type,
                        rentalID,
                    }), // Metadata for tracking
                    description: `Subscription payment by User ${userId}`,
                },
            ],
            application_context: {
                return_url: `${process.env.PAYMENT_SERVICE_URL}/capture`, // Redirect here after approval
            },
        });
        try {
            const order = await paypalClient_1.default.execute(request);
            // Extract approval URL for redirecting the user
            const approvalUrl = order.result.links?.find((link) => link.rel === "approve")?.href;
            if (!approvalUrl) {
                throw new Error("Approval link not found in PayPal response.");
            }
            console.log("Order created:", order.result);
            // Store the order ID in the database with Pending status
            await prisma_1.default.payment.create({
                data: {
                    userId,
                    method: "PayPal",
                    amount,
                    type,
                    referenceId: order.result.id, // Order ID to track the payment
                    status: "Pending", // Initial status
                },
            });
            // Return the order ID and approval URL for further processing
            return {
                orderId: order.result.id,
                approvalUrl, // Send this to the frontend for approval
            };
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error creating PayPal order:", error.message);
                throw new Error("Failed to process PayPal payment");
            }
            else {
                console.error("Unexpected error:", error);
                throw new Error("An unknown error occurred while processing PayPal payment");
            }
        }
    }
    /**
     * Capture payment after the user approves the order.
     */
    async capturePayment(orderId) {
        if (!orderId) {
            throw new Error("Order ID is required to capture payment.");
        }
        const request = new checkout_server_sdk_1.default.orders.OrdersCaptureRequest(orderId);
        request.requestBody({}); // Required but can be empty for capture
        try {
            const captureResponse = await paypalClient_1.default.execute(request);
            const captureId = captureResponse.result.purchase_units[0].payments?.captures?.[0]?.id;
            if (!captureId) {
                throw new Error("Capture ID not found in the capture response");
            }
            console.log("Payment captured successfully:", captureId);
            return {
                captureId,
                details: captureResponse.result,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error capturing PayPal payment:", error.message);
                throw new Error("Failed to capture PayPal payment");
            }
            else {
                console.error("Unexpected error:", error);
                throw new Error("An unknown error occurred while capturing PayPal payment");
            }
        }
    }
    /**
     * Handle refunds for a captured transaction.
     */
    async processRefund(transactionId, amount) {
        if (!transactionId) {
            throw new Error("Transaction ID is required for refund.");
        }
        const refundRequest = new checkout_server_sdk_1.default.payments.CapturesRefundRequest(transactionId);
        refundRequest.requestBody({
            amount: amount
                ? { value: amount.toFixed(2), currency_code: "EUR" } // Euros
                : undefined, // Full refund if no amount specified
        });
        try {
            const refund = await paypalClient_1.default.execute(refundRequest);
            console.log("Refund created:", refund.result);
            return refund.result;
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error creating PayPal refund:", error.message);
                throw new Error("Failed to create PayPal refund");
            }
            else {
                console.error("Unexpected error:", error);
                throw new Error("An unknown error occurred while processing the PayPal refund");
            }
        }
    }
}
exports.PayPalPayment = PayPalPayment;
