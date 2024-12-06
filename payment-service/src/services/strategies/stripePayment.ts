import { PaymentStrategy } from "./paymentStrategy"; // Import PaymentStrategy
import stripe from "../../clients/stripeClient";
import prisma from "../../clients/prisma";

export class StripePayment implements PaymentStrategy {
  async processPayment(
    amount: number,
    userId: number,
    cookies: string,
    type: string,
    rentalID: number
  ): Promise<any> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "eur",
        metadata: {
          userId: userId.toString(),
          cookies,
          type,
          ...(rentalID ? { rentalID: rentalID.toString() } : {}),
        },
        payment_method_types: ["card"],
      });

      console.log("Payment Intent Created:", paymentIntent);

      await prisma.payment.create({
        data: {
          userId,
          method: "Stripe",
          amount,
          type,
          referenceId: paymentIntent.id,
          status: "Pending",
          rentalID,
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

  async processRefund(
    transactionId: string,
    amount: number,
    userId: number,
    cookies: string,
    type: string,
    rentalID: number
  ): Promise<any> {
    try {
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [{ referenceId: transactionId }, { rentalID }],
        },
      });

      if (!payment) {
        throw new Error(
          "Payment record not found for the given transactionId or rentalID."
        );
      }

      await prisma.refund.create({
        data: {
          paymentId: payment.id,
          amount,
          status: "Pending",
          referenceId: transactionId,
          rentalID,
          userId,
        },
      });
      const refund = await stripe.refunds.create({
        payment_intent: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined,
        metadata: {
          userId: userId.toString(),
          cookies,
          type,
          ...(rentalID ? { rentalID: rentalID.toString() } : {}),
        },
      });

      console.log("Refund created:", refund);
      return refund;
    } catch (error: any) {
      console.error("Error creating Refund:", error.message);
      throw new Error("Failed to create Refund");
    }
  }
}
