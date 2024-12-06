import { Observer } from "./Observer";
import {
  handleStripePaymentUpdate,
  handlePayPalPaymentUpdate,
} from "../utils/paymentUtils";

export class CycleRentalObserver implements Observer {
  async update(event: string, paymethod: string, data: any): Promise<void> {
    const allowedTypes = ["Cycle rental", "Deposit refund"];
    const type = data.type;

    if (!allowedTypes.includes(type)) return;

    if (event === "Success" || event === "Failed") {
      console.log("Hi");
      const {
        userId,
        status,
        cookies,
        paymentIntentId,
        orderId,
        captureId,
        rentalID,
        isRefund,
        refundId,
        refundAmount,
        referenceId,
      } = data;

      console.log(
        `[CycleRentalObserver] Notifying Cycle service for user ${userId} (Type: ${type}, Event: ${event})`
      );

      try {
        console.log(type);
        if (paymethod === "Stripe") {
          await handleStripePaymentUpdate({
            referenceId,
            status,
            userId,
            cookies,
            type,
            rentalID,
            isRefund,
            refundId,
            refundAmount,
          });
        } else if (paymethod === "PayPal") {
          await handlePayPalPaymentUpdate({
            referenceId,
            status,
            userId,
            cookies,
            type,
            rentalID,
            isRefund,
            refundId,
            refundAmount,
            captureId,
          });
        } else {
          console.warn(
            `[CycleRentalObserver] Unsupported payment method: ${paymethod}`
          );
        }
      } catch (error) {
        console.error(
          `[CycleRentalObserver] Error notifying cycle service for user ${userId} (Type: ${type}, Event: ${event}):`,
          error
        );
      }
    }
  }
}
