import { PaymentStrategy } from "./paymentStrategy";
import paypal from "@paypal/checkout-server-sdk";
import client from "../../clients/paypalClient";
import prisma from "../../clients/prisma";

export class PayPalPayment implements PaymentStrategy {
  async processPayment(
    amount: number,
    userId: number,
    cookies: string,
    type: string,
    rentalID: number
  ): Promise<any> {
    if (amount <= 0) {
      throw new Error(
        "Invalid amount. Payment amount must be greater than zero."
      );
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { value: amount.toFixed(2), currency_code: "EUR" },
          custom_id: JSON.stringify({
            userId,
            metadata: { cookies },
            ...(rentalID ? { rentalID: rentalID.toString() } : {}),
          }),
          description: type,
        },
      ],
      application_context: {
        return_url: `${process.env.PAYMENT_SERVICE_URL}/capture`,
      },
    });

    try {
      const order = await client.execute(request);

      const approvalUrl = order.result.links?.find(
        (link: { rel: string; href: string }) => link.rel === "approve"
      )?.href;

      if (!approvalUrl) {
        throw new Error("Approval link not found in PayPal response.");
      }

      console.log("Order created:", order.result);

      await prisma.payment.create({
        data: {
          userId,
          method: "PayPal",
          amount,
          type,
          referenceId: order.result.id,
          status: "Pending",
          rentalID,
        },
      });

      console.log(type);

      return {
        orderId: order.result.id,
        approvalUrl,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating PayPal order:", error.message);
        throw new Error("Failed to process PayPal payment");
      } else {
        console.error("Unexpected error:", error);
        throw new Error(
          "An unknown error occurred while processing PayPal payment"
        );
      }
    }
  }

  async capturePayment(orderId: string): Promise<any> {
    if (!orderId) {
      throw new Error("Order ID is required to capture payment.");
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const captureResponse = await client.execute(request);
      const captureId =
        captureResponse.result.purchase_units[0].payments?.captures?.[0]?.id;

      if (!captureId) {
        throw new Error("Capture ID not found in the capture response");
      }

      console.log("Payment captured successfully:", captureId);

      return {
        captureId,
        details: captureResponse.result,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error capturing PayPal payment:", error.message);
        throw new Error("Failed to capture PayPal payment");
      } else {
        console.error("Unexpected error:", error);
        throw new Error(
          "An unknown error occurred while capturing PayPal payment"
        );
      }
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
    if (!transactionId) {
      throw new Error("Transaction ID is required for refund.");
    }

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

    const refundRequest = new paypal.payments.CapturesRefundRequest(
      transactionId
    );
    refundRequest.requestBody({
      amount: amount
        ? { value: amount.toFixed(2), currency_code: "EUR" }
        : undefined,
      custom_id: JSON.stringify({
        userId,
        metadata: { cookies },
        ...(rentalID ? { rentalID: rentalID.toString() } : {}),
        description: type,
      }),
    });

    try {
      const refund = await client.execute(refundRequest);
      console.log("Refund created:", refund.result);
      return refund.result;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating PayPal refund:", error.message);
        throw new Error("Failed to create PayPal refund");
      } else {
        console.error("Unexpected error:", error);
        throw new Error(
          "An unknown error occurred while processing the PayPal refund"
        );
      }
    }
  }
}
