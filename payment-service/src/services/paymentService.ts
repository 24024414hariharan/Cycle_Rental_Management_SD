import { PaymentStrategy } from "./strategies/paymentStrategy";
import { StripePayment } from "./strategies/stripePayment"; // Import StripePayment
import { PayPalPayment } from "./strategies/paypalPayment"; // Import PayPalPayment

class PaymentService {
  constructor(private paymentStrategy: PaymentStrategy) {}

  async processPayment(userId: number, amount: number, cookies: string) {
    const paymentResponse = await this.paymentStrategy.processPayment(
      amount,
      userId,
      cookies
    );

    const method =
      this.paymentStrategy instanceof StripePayment
        ? "Stripe"
        : this.paymentStrategy instanceof PayPalPayment
        ? "PayPal"
        : "Unknown";

    return paymentResponse;
  }

  async processRefund(transactionId: string, amount?: number) {
    return await this.paymentStrategy.processRefund(transactionId, amount);
  }
}

export default PaymentService;