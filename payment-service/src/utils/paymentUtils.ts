import prisma from "../clients/prisma";
import axios from "axios";

const subscriptionServiceUrl = `${process.env.SUBSCRIPTION_SERVICE_URL}/api/subscription/update-status`;
const cycleServiceUrl = `${process.env.Cycle_SERVICE_URL}/api/cycles/update-status`;

// Stripe-specific payment update handler
export const handleStripePaymentUpdate = async (
  referenceId: string,
  status: string,
  userId: string,
  cookies: string,
  type: string,
  rentalID?: string
) => {
  try {
    console.log("Stripe payment update received:", {
      referenceId,
      status,
      userId,
      rentalID,
    });

    // Check if the payment exists
    const paymentRecord = await prisma.payment.findUnique({
      where: { referenceId },
    });

    if (!paymentRecord) {
      console.error("Stripe payment record not found:", { referenceId });
      throw new Error("Payment record not found.");
    }

    // Update payment status
    await prisma.payment.update({
      where: { referenceId },
      data: { status },
    });

    console.log(`Stripe payment ${status.toLowerCase()} for userId: ${userId}`);

    if (type === "Subscription") {
      await notifySubscriptionService(userId, status, cookies);
    } else {
      if (rentalID !== undefined) {
        await notifyCycleService(userId, status, cookies, rentalID);
      }
    }
  } catch (err: any) {
    console.error(`Error updating Stripe payment: ${err.message}`);
    throw new Error("Failed to handle Stripe payment update.");
  }
};

// PayPal-specific payment update handler
export const handlePayPalPaymentUpdate = async (
  referenceId: string,
  status: string,
  userId: string,
  captureId: string,
  cookies: string,
  type: string,
  rentalID?: string
) => {
  try {
    console.log("PayPal payment update received:", {
      referenceId,
      status,
      userId,
      captureId,
    });

    // Find the payment record by orderId
    const paymentRecord = await prisma.payment.findUnique({
      where: { referenceId },
    });

    if (!paymentRecord) {
      console.error("PayPal payment record not found:", { referenceId });
      throw new Error("Payment record not found.");
    }

    // Update the record with captureId and status
    await prisma.payment.update({
      where: { referenceId },
      data: {
        captureId,
        status,
      },
    });

    console.log(`PayPal payment ${status.toLowerCase()} for userId: ${userId}`);

    if (type === "Subscription") {
      await notifySubscriptionService(userId, status, cookies);
    } else {
      if (rentalID !== undefined) {
        await notifyCycleService(userId, status, cookies, rentalID);
      }
    }
  } catch (err: any) {
    console.error(`Error updating PayPal payment: ${err.message}`);
    throw new Error("Failed to handle PayPal payment update.");
  }
};

// Notify the subscription service
const notifySubscriptionService = async (
  userId: string,
  status: string,
  cookies: string
) => {
  try {
    await axios.post(
      subscriptionServiceUrl,
      {
        userId: parseInt(userId, 10),
        status,
      },
      {
        headers: {
          "Content-Type": "application/json",
          cookie: cookies,
        },
      }
    );
  } catch (err: any) {
    console.error(`Error notifying subscription service: ${err.message}`);
    throw new Error("Failed to notify subscription service.");
  }
};

const notifyCycleService = async (
  userId: string,
  status: string,
  cookies: string,
  rentalID: string
) => {
  try {
    await axios.post(
      cycleServiceUrl,
      {
        userId: parseInt(userId, 10),
        status,
        rentalID: parseInt(rentalID, 10),
      },
      {
        headers: {
          "Content-Type": "application/json",
          cookie: cookies,
        },
      }
    );
  } catch (err: any) {
    console.error(`Error notifying Cycle service: ${err.message}`);
    throw new Error("Failed to notify Cycle service.");
  }
};
