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

    switch (event.type as string) {
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const status =
          event.type === "payment_intent.succeeded" ? "Success" : "Failed";

        const userId = paymentIntent.metadata?.userId;
        const cookies = paymentIntent.metadata?.cookies;
        const type = paymentIntent.metadata?.type;
        const rentalID = paymentIntent.metadata?.rentalID;
        const referenceId = paymentIntent.id;

        console.log(referenceId);

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
          referenceId,
          rentalID,
          isRefund: false,
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

      case "refund.updated": {
        const refund = event.data.object as Stripe.Refund;

        const refundStatus = refund.status;
        const type = refund.metadata?.type;
        const refundId = refund.id;
        const userId = refund.metadata?.userId;
        const rentalID = refund.metadata?.rentalID;
        const cookies = refund.metadata?.cookies;
        const refundAmount = refund.amount / 100;
        const referenceId = refund.payment_intent;

        if (!userId) {
          console.error(
            "[Stripe Webhook] Error: Missing userId in refund metadata."
          );
          res.status(400).send("Webhook Error: Missing userId.");
          return;
        }

        const status = refundStatus === "succeeded" ? "Success" : "Failed";
        console.log(status);

        console.log(
          `[Stripe Webhook] Refund ${refundStatus} for Refund ID: ${refundId}`
        );

        const paymethod = "Stripe";

        await paymentEventSubject.notify(status, paymethod, {
          status,
          refundId,
          userId,
          rentalID,
          refundAmount,
          cookies,
          isRefund: true,
          type,
          referenceId,
        });

        break;
      }

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
    const {
      "paypal-transmission-id": transmissionId,
      "paypal-transmission-time": transmissionTime,
      "paypal-cert-url": certUrl,
      "paypal-auth-algo": authAlgo,
      "paypal-transmission-sig": transmissionSig,
    } = req.headers;

    if (
      !transmissionId ||
      !transmissionTime ||
      !certUrl ||
      !authAlgo ||
      !transmissionSig
    ) {
      throw new Error(
        "Missing required PayPal headers for webhook validation."
      );
    }

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId)
      throw new Error("Missing PAYPAL_WEBHOOK_ID in environment variables.");

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
      throw new Error("Webhook validation failed.");
    }

    const event = req.body;
    const captureId = event.resource?.id;
    const referenceId =
      event.resource?.supplementary_data?.related_ids?.order_id;
    const customId = event.resource?.custom_id;

    if (!customId || typeof customId !== "string") {
      throw new Error("Invalid or missing `custom_id` format.");
    }

    const customData = JSON.parse(customId);
    const { userId, type, metadata, rentalID } = customData;

    if (!userId || !metadata || !metadata.cookies) {
      throw new Error("Invalid `custom_id` format. Missing required fields.");
    }

    const cookies = metadata.cookies;
    const paymethod = "PayPal";

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      if (!captureId || !userId) {
        throw new Error("Missing required fields: `captureId` or `userId`.");
      }

      const status = "Success";
      await paymentEventSubject.notify(status, paymethod, {
        referenceId,
        status,
        userId,
        cookies,
        captureId,
        type,
        rentalID,
      });

      console.log(`[PayPal Webhook] Payment success for userId: ${userId}`);
    } else if (event.event_type === "PAYMENT.CAPTURE.DENIED") {
      const status = "Failed";
      await paymentEventSubject.notify(status, paymethod, {
        referenceId,
        status,
        userId,
        cookies,
        captureId,
        type,
        rentalID,
      });

      console.log(`[PayPal Webhook] Payment failed for userId: ${userId}`);
    } else if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
      const refund = event.resource;
      const refundStatus = refund.status;
      const refundId = refund.id;
      const refundAmount = parseFloat(refund.amount.value);
      const refundCurrency = refund.amount.currency_code;

      console.log(refund);

      console.log(
        `[PayPal Webhook] Refund completed for Refund ID: ${refundId}`
      );

      const customId = refund.custom_id;
      if (!customId || typeof customId !== "string") {
        throw new Error("Invalid or missing `custom_id` in refund event.");
      }

      let customData;
      try {
        customData = JSON.parse(customId);
      } catch (parseError) {
        throw new Error(`Failed to parse custom_id`);
      }

      const { userId, type, metadata, rentalID } = customData;
      if (!userId || !metadata || !metadata.cookies) {
        throw new Error("Invalid `custom_id` format. Missing required fields.");
      }

      const cookies = metadata.cookies;
      const status = refundStatus === "COMPLETED" ? "Success" : "Failed";

      const captureLink = refund.links?.find(
        (link: { rel: string }) => link.rel === "up"
      );
      const captureId = captureLink?.href.split("/").pop();

      if (!captureId) {
        throw new Error("Capture ID not found in refund links.");
      }

      await paymentEventSubject.notify(status, "PayPal", {
        status,
        refundId,
        userId,
        rentalID,
        refundAmount,
        refundCurrency,
        cookies,
        isRefund: true,
        type,
        referenceId: captureId,
      });
    } else {
      console.log(`[PayPal Webhook] Unhandled event type: ${event.event_type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(`[PayPal Webhook] Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
