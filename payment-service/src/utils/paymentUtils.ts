import prisma from "../clients/prisma";
import { notifyService } from "../utils/notifyService";

const subscriptionServiceUrl = `${process.env.SUBSCRIPTION_SERVICE_URL}/api/subscription/update-status`;
const cycleServiceUrl = `${process.env.CYCLE_SERVICE_URL}/api/cycles/update-status`;

export const handleStripePaymentUpdate = async ({
  referenceId,
  status,
  userId,
  cookies,
  type,
  isRefund = false,
  rentalID,
  refundId,
  refundAmount,
}: {
  referenceId: string;
  status: string;
  userId: string;
  cookies: string;
  type: string;
  isRefund?: boolean;
  rentalID?: string;
  refundId?: string;
  refundAmount?: number;
}): Promise<void> => {
  try {
    console.log("Hi");
    console.log(isRefund);
    console.log("Stripe update received:", {
      referenceId,
      status,
      userId,
      rentalID,
      isRefund,
    });

    if (isRefund) {
      await handleRefundUpdate(
        referenceId,
        refundId,
        status,
        userId,
        cookies,
        rentalID,
        type
      );
    } else {
      await handlePaymentUpdate(
        referenceId,
        status,
        userId,
        cookies,
        type,
        rentalID
      );
    }
  } catch (err: any) {
    console.error(`Error handling Stripe update: ${err.message}`);
    throw new Error(`Failed to handle Stripe update.`);
  }
};

export const handlePayPalPaymentUpdate = async ({
  referenceId,
  status,
  userId,
  cookies,
  type,
  isRefund = false,
  rentalID,
  refundId,
  refundAmount,
  captureId,
}: {
  referenceId: string;
  status: string;
  userId: string;
  cookies: string;
  type: string;
  isRefund?: boolean;
  rentalID?: string;
  refundId?: string;
  refundAmount?: number;
  captureId?: string;
}): Promise<void> => {
  try {
    console.log("PayPal update received:", {
      referenceId,
      status,
      userId,
      rentalID,
      isRefund,
    });

    if (isRefund) {
      await handleRefundUpdate(
        referenceId,
        refundId,
        status,
        userId,
        cookies,
        rentalID,
        type
      );
    } else {
      await handlePaymentUpdate(
        referenceId,
        status,
        userId,
        cookies,
        type,
        rentalID,
        captureId
      );
    }
  } catch (err: any) {
    console.error(`Error handling PayPal update: ${err.message}`);
    throw new Error(`Failed to handle PayPal update.`);
  }
};

const handleRefundUpdate = async (
  referenceId: string,
  refundId: string | undefined,
  status: string,
  userId: string,
  cookies: string,
  rentalID: string | undefined,
  type: string
) => {
  if (!refundId) throw new Error("Missing refund ID for refund update.");

  const refundRecord = await prisma.refund.findUnique({
    where: { referenceId },
  });
  if (!refundRecord) throw new Error("Refund record not found.");

  await prisma.refund.update({
    where: { referenceId },
    data: { status },
  });

  if (type === "Deposit refund" && rentalID) {
    await notifyService(
      cycleServiceUrl,
      {
        userId: parseInt(userId, 10),
        status,
        rentalID: parseInt(rentalID, 10),
        type,
      },
      cookies
    );
  }
};

const handlePaymentUpdate = async (
  referenceId: string,
  status: string,
  userId: string,
  cookies: string,
  type: string,
  rentalID?: string,
  captureId?: string
) => {
  const paymentRecord = await prisma.payment.findUnique({
    where: { referenceId },
  });
  if (!paymentRecord) throw new Error("Payment record not found.");

  const updateData: any = { status };
  if (captureId) updateData.captureId = captureId;

  await prisma.payment.update({
    where: { referenceId },
    data: updateData,
  });

  if (type === "Subscription") {
    await notifyService(
      subscriptionServiceUrl,
      { userId: parseInt(userId, 10), status },
      cookies
    );
  } else if (type === "Cycle rental" && rentalID) {
    await notifyService(
      cycleServiceUrl,
      {
        userId: parseInt(userId, 10),
        status,
        rentalID: parseInt(rentalID, 10),
        type,
      },
      cookies
    );
  }
};
