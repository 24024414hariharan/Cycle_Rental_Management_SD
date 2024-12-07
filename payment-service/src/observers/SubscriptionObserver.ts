import { Observer } from "./Observer";
import {
  handleStripePaymentUpdate,
  handlePayPalPaymentUpdate,
} from "../utils/paymentUtils";

export class SubscriptionObserver implements Observer {
  async update(event: string, paymethod: string, data: any): Promise<void> {
    const type = data.type;

    if (type !== "Subscription") return; // Ensure this observer only handles subscriptions.

    if (event === "Success" || event === "Failed") {
      const { userId, status, cookies, referenceId, captureId } = data;

      console.log(
        `[SubscriptionObserver] Notifying subscription service for user ${userId}`
      );

      try {
        if (paymethod === "Stripe") {
          // Pass only relevant data for subscriptions
          await handleStripePaymentUpdate({
            referenceId,
            status,
            userId,
            cookies,
            type,
          });
        } else {
          await handlePayPalPaymentUpdate({
            referenceId,
            status,
            userId,
            captureId,
            cookies,
            type,
          });
        }
      } catch (error) {
        console.error(
          `[SubscriptionObserver] Error notifying subscription service:`,
          error
        );
      }
    }
  }
}
