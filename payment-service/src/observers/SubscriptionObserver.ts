// src/observers/SubscriptionObserver.ts
import { Observer } from "./Observer";
import axios from "axios";
import {
  handleStripePaymentUpdate,
  handlePayPalPaymentUpdate,
} from "../utils/paymentUtils";

export class SubscriptionObserver implements Observer {
  async update(event: string, paymethod: string, data: any): Promise<void> {
    if (event === "Success" || event === "Failed") {
      const { userId, status, cookies, paymentIntentId, orderId, captureId } =
        data;

      console.log(
        `[SubscriptionObserver] Notifying subscription service for user ${userId}`
      );

      try {
        if (paymethod === "Stripe") {
          await handleStripePaymentUpdate(
            paymentIntentId,
            status,
            userId,
            cookies
          );
        } else {
          await handlePayPalPaymentUpdate(
            orderId,
            status,
            userId,
            captureId,
            cookies
          );
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
