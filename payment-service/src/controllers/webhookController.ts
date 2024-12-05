import { Request, Response } from "express";
import stripe from "../clients/stripeClient";
import Stripe from "stripe";
import { getAccessToken } from "../utils/paypalUtils";
import { paymentEventSubject } from "../observers/PaymentEventSubject";
import axios from "axios";

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    switch (event.type) {
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const status =
          event.type === "payment_intent.succeeded" ? "Success" : "Failed";

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

        await paymentEventSubject.notify(status, paymethod, {
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
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export const paypalWebhookHandler = async (req: Request, res: Response) => {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      throw new Error("Missing PAYPAL_WEBHOOK_ID in environment variables.");
    }

    const transmissionId = req.headers["paypal-transmission-id"] as string;
    const transmissionTime = req.headers["paypal-transmission-time"] as string;
    const certUrl = req.headers["paypal-cert-url"] as string;
    const authAlgo = req.headers["paypal-auth-algo"] as string;
    const transmissionSig = req.headers["paypal-transmission-sig"] as string;

    if (
      !transmissionId ||
      !transmissionTime ||
      !certUrl ||
      !authAlgo ||
      !transmissionSig
    ) {
      console.error("[PayPal Webhook] Missing required headers.", {
        transmissionId,
        transmissionTime,
        certUrl,
        authAlgo,
        transmissionSig,
      });
      throw new Error(
        "Missing required PayPal headers for webhook validation."
      );
    }

    const rawBody = JSON.stringify(req.body);

    const verificationResponse = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature",
      {
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: req.body,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      }
    );

    if (verificationResponse.data.verification_status !== "SUCCESS") {
      console.error(
        "[PayPal Webhook] Validation failed:",
        verificationResponse.data
      );
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

      await paymentEventSubject.notify(status, paymethod, {
        orderId,
        status,
        userId,
        cookies,
        captureId,
        type,
        rentalID,
      });

      console.log(`[PayPal Webhook] Payment success for userId: ${userId}`);
    } else if (event.event_type === "PAYMENT.CAPTURE.DENIED") {
      if (!captureId || !userId) {
        console.error("[PayPal Webhook] Missing captureId or userId.");
        res.status(400).send("Webhook Error: Missing required fields.");
        return;
      }

      const status = "Failed";
      await paymentEventSubject.notify(status, paymethod, {
        orderId,
        status,
        userId,
        cookies,
        captureId,
      });

      console.log(`[PayPal Webhook] Payment failed for userId: ${userId}`);
    } else {
      console.log(`[PayPal Webhook] Unhandled event type: ${event.event_type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(`[PayPal Webhook] Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
