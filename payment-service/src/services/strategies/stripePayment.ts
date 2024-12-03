import { PaymentStrategy } from "./paymentStrategy"; // Import PaymentStrategy
import stripe from "../../clients/stripeClient";
import prisma from "../../clients/prisma";

export class StripePayment implements PaymentStrategy {
  async processPayment(
    amount: number,
    userId: number,
    cookies: string
  ): Promise<any> {
    try {
      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: "eur",
        metadata: { userId: userId.toString(), cookies },
        payment_method_types: ["card"],
      });

      console.log("Payment Intent Created:", paymentIntent);

      await prisma.payment.create({
        data: {
          userId,
          method: "Stripe",
          amount,
          referenceId: paymentIntent.id,
          status: "Pending",
        },
      });

      const testToken = "pm_card_visa";

      const confirmedIntent = await stripe.paymentIntents.confirm(
        paymentIntent.id,
        { payment_method: testToken }
      );

      console.log("Payment Intent Confirmed:", confirmedIntent);

      return confirmedIntent;
    } catch (error: any) {
      console.error("Error processing payment:", error.message);
      throw new Error("Failed to create and confirm Payment Intent");
    }
  }

  async processRefund(transactionId: string, amount?: number): Promise<any> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial refund
      });

      console.log("Refund created:", refund);
      return refund;
    } catch (error: any) {
      console.error("Error creating Refund:", error.message);
      throw new Error("Failed to create Refund");
    }
  }
}
