import { Observer } from "./Observer";
import {
  handleStripePaymentUpdate,
  handlePayPalPaymentUpdate,
} from "../utils/paymentUtils";

export class CycleRentalObserver implements Observer {
  async update(event: string, paymethod: string, data: any): Promise<void> {
    const type = data.type;
    if (type !== "Cycle rental") return;
    if (event === "Success" || event === "Failed") {
      const {
        userId,
        status,
        cookies,
        paymentIntentId,
        orderId,
        captureId,
        rentalID,
      } = data;

      console.log(
        `[CycleRentalObserver] Notifying Cycle service for user ${userId}`
      );

      try {
        if (paymethod === "Stripe") {
          await handleStripePaymentUpdate(
            paymentIntentId,
            status,
            userId,
            cookies,
            type,
            rentalID
          );
        } else {
          await handlePayPalPaymentUpdate(
            orderId,
            status,
            userId,
            captureId,
            cookies,
            type,
            rentalID
          );
        }
      } catch (error) {
        console.error(
          `[CycleRentalObserver] Error notifying cycle service:`,
          error
        );
      }
    }
  }
}
