"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paypalCapture = exports.createPayment = void 0;
const stripePayment_1 = require("../services/strategies/stripePayment");
const paypalPayment_1 = require("../services/strategies/paypalPayment");
const paymentService_1 = __importDefault(require("../services/paymentService"));
const errorHandler_1 = require("../middleware/errorHandler");
const paypalPayment = new paypalPayment_1.PayPalPayment();
const createPayment = async (req, res) => {
    const { paymentMethod, amount } = req.body;
    const userId = req.user?.userId;
    const cookies = req.headers.cookie || "";
    if (!userId) {
        throw new errorHandler_1.AppError("Unauthorized: User ID is missing.", 401);
    }
    if (typeof amount !== "number" || amount <= 0) {
        throw new errorHandler_1.AppError("Invalid amount: Must be a positive number.", 400);
    }
    const strategy = paymentMethod === "Stripe" ? new stripePayment_1.StripePayment() : new paypalPayment_1.PayPalPayment();
    const paymentService = new paymentService_1.default(strategy);
    // Initiate payment
    const paymentResponse = await paymentService.processPayment(userId, amount, cookies);
    res.json({
        status: "pending",
        data: {
            clientSecret: paymentResponse.client_secret || null, // For Stripe
            approvalUrl: paymentResponse.approvalUrl || null, // For PayPal
        },
    });
};
exports.createPayment = createPayment;
const paypalCapture = async (req, res) => {
    const { token } = req.query; // Extract `token` from the query string
    // Ensure the token (orderId) exists
    if (!token || typeof token !== "string") {
        return res.status(400).json({
            status: "error",
            message: "Order ID (token) is required to capture payment.",
        });
    }
    console.log("Order ID (token):", token);
    try {
        // Pass the token (orderId) to the capturePayment method
        const captureResponse = await paypalPayment.capturePayment(token);
        res.json({
            status: "success",
            message: "Payment captured successfully.",
            data: captureResponse,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
        else {
            res.status(500).json({
                status: "error",
                message: "An unknown error occurred.",
            });
        }
    }
};
exports.paypalCapture = paypalCapture;
