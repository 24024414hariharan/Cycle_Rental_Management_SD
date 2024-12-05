"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paypalWebhookHandler = exports.stripeWebhookHandler = void 0;
const stripeClient_1 = __importDefault(require("../clients/stripeClient"));
const paypalUtils_1 = require("../utils/paypalUtils");
const PaymentEventSubject_1 = require("../observers/PaymentEventSubject");
const axios_1 = __importDefault(require("axios"));
const stripeWebhookHandler = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    try {
        const event = stripeClient_1.default.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        switch (event.type) {
            case "payment_intent.succeeded":
            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object;
                const status = event.type === "payment_intent.succeeded" ? "Success" : "Failed";
                const userId = paymentIntent.metadata?.userId;
                const cookies = paymentIntent.metadata?.cookies;
                const type = paymentIntent.metadata?.type;
                const rentalID = paymentIntent.metadata?.rentalID;
                if (!userId) {
                    console.error("[Stripe Webhook] Error: Missing userId in metadata.");
                    res.status(400).send("Webhook Error: Missing userId.");
                    return;
                }
                const paymethod = "Stripe";
                await PaymentEventSubject_1.paymentEventSubject.notify(status, paymethod, {
                    status,
                    userId,
                    cookies,
                    type,
                    paymentIntentId: paymentIntent.id,
                    rentalID,
                });
                console.log(`[Stripe Webhook] Processed payment: ${status}`);
                break;
            }
            case "charge.updated":
            case "payment_intent.created":
                console.log(`[Stripe Webhook] Skipping event type: ${event.type}`);
                break;
            case "charge.dispute.created":
            case "charge.dispute.updated":
            case "charge.dispute.closed":
            case "charge.succeeded":
                console.log(`[Stripe Webhook] Skipping event type: ${event.type}`);
                break;
            default:
                console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (err) {
        console.error(`[Stripe Webhook] Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
exports.stripeWebhookHandler = stripeWebhookHandler;
const paypalWebhookHandler = async (req, res) => {
    try {
        const webhookId = process.env.PAYPAL_WEBHOOK_ID;
        if (!webhookId) {
            throw new Error("Missing PAYPAL_WEBHOOK_ID in environment variables.");
        }
        const transmissionId = req.headers["paypal-transmission-id"];
        const transmissionTime = req.headers["paypal-transmission-time"];
        const certUrl = req.headers["paypal-cert-url"];
        const authAlgo = req.headers["paypal-auth-algo"];
        const transmissionSig = req.headers["paypal-transmission-sig"];
        if (!transmissionId ||
            !transmissionTime ||
            !certUrl ||
            !authAlgo ||
            !transmissionSig) {
            console.error("[PayPal Webhook] Missing required headers.", {
                transmissionId,
                transmissionTime,
                certUrl,
                authAlgo,
                transmissionSig,
            });
            throw new Error("Missing required PayPal headers for webhook validation.");
        }
        const rawBody = JSON.stringify(req.body);
        const verificationResponse = await axios_1.default.post("https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature", {
            transmission_id: transmissionId,
            transmission_time: transmissionTime,
            cert_url: certUrl,
            auth_algo: authAlgo,
            transmission_sig: transmissionSig,
            webhook_id: webhookId,
            webhook_event: req.body,
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await (0, paypalUtils_1.getAccessToken)()}`,
            },
        });
        if (verificationResponse.data.verification_status !== "SUCCESS") {
            console.error("[PayPal Webhook] Validation failed:", verificationResponse.data);
            res.status(400).send("Webhook validation failed.");
            return;
        }
        const event = req.body;
        const captureId = event.resource?.id;
        const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
        const customData = event.resource?.custom_id
            ? JSON.parse(event.resource.custom_id)
            : null;
        if (!customData || !customData.userId || !customData.metadata?.cookies) {
            console.error("[PayPal Webhook] Invalid custom_id format.");
            res.status(400).send("Webhook Error: Invalid custom_id format.");
            return;
        }
        const userId = customData.userId;
        const cookies = customData.metadata.cookies;
        const type = customData.type;
        const rentalID = customData.rentalID;
        const paymethod = "PayPal";
        if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
            if (!captureId || !userId) {
                console.error("[PayPal Webhook] Missing captureId or userId.");
                res.status(400).send("Webhook Error: Missing required fields.");
                return;
            }
            const status = "Success";
            await PaymentEventSubject_1.paymentEventSubject.notify(status, paymethod, {
                orderId,
                status,
                userId,
                cookies,
                captureId,
                type,
                rentalID,
            });
            console.log(`[PayPal Webhook] Payment success for userId: ${userId}`);
        }
        else if (event.event_type === "PAYMENT.CAPTURE.DENIED") {
            if (!captureId || !userId) {
                console.error("[PayPal Webhook] Missing captureId or userId.");
                res.status(400).send("Webhook Error: Missing required fields.");
                return;
            }
            const status = "Failed";
            await PaymentEventSubject_1.paymentEventSubject.notify(status, paymethod, {
                orderId,
                status,
                userId,
                cookies,
                captureId,
            });
            console.log(`[PayPal Webhook] Payment failed for userId: ${userId}`);
        }
        else {
            console.log(`[PayPal Webhook] Unhandled event type: ${event.event_type}`);
        }
        res.json({ received: true });
    }
    catch (err) {
        console.error(`[PayPal Webhook] Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
exports.paypalWebhookHandler = paypalWebhookHandler;
