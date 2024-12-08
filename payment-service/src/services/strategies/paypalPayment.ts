import axios from "axios";
import prisma from "../../clients/prisma";
import { PaymentStrategy } from "../strategies/paymentStrategy";
import PAYPAL_API_BASE_URL from "../../clients/paypalClient";
import { getAccessToken } from "../../utils/paypalUtils";

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

    try {
      const accessToken = await getAccessToken();

      const response = await axios.post(
        `${PAYPAL_API_BASE_URL}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "EUR",
                value: amount.toFixed(2),
              },
              custom_id: JSON.stringify({
                userId,
                type,
                metadata: { cookies },
                ...(rentalID ? { rentalID: rentalID.toString() } : {}),
              }),
            },
          ],
          application_context: {
            return_url: `${process.env.PAYMENT_SERVICE_URL}/capture`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const order = response.data;

      console.log("PayPal order links:", order.links);

      const approvalUrl = order.links?.find(
        (link: { rel: string; href: string }) => link.rel === "approve"
      )?.href;

      if (!approvalUrl) {
        throw new Error("Approval link not found in PayPal response.");
      }

      await prisma.payment.create({
        data: {
          userId,
          method: "PayPal",
          amount,
          type,
          referenceId: order.id,
          status: "Pending",
          rentalID,
        },
      });

      return {
        orderId: order.id,
        approvalUrl,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw new Error("Failed to process PayPal payment.");
    }
  }

  async capturePayment(orderId: string): Promise<any> {
    if (!orderId) {
      throw new Error("Order ID is required to capture payment.");
    }

    try {
      const accessToken = await getAccessToken();

      const response = await axios.post(
        `${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const capture = response.data;

      await prisma.payment.update({
        where: { referenceId: orderId },
        data: { status: "Captured" },
      });

      console.log("Payment captured successfully:", capture);

      return capture;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw new Error("Failed to capture PayPal payment.");
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

      const captureId = payment.captureId;
      if (!captureId) {
        throw new Error("Capture ID is missing for the payment.");
      }

      await prisma.refund.create({
        data: {
          paymentId: payment.id,
          amount,
          status: "Pending",
          referenceId: captureId,
          rentalID,
          userId,
        },
      });

      const accessToken = await getAccessToken();

      const response = await axios.post(
        `${PAYPAL_API_BASE_URL}/v2/payments/captures/${captureId}/refund`,
        {
          amount: {
            value: amount.toFixed(2),
            currency_code: "EUR",
          },
          custom_id: JSON.stringify({
            userId,
            type,
            metadata: { cookies },
            ...(rentalID ? { rentalID: rentalID.toString() } : {}),
          }),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const refund = response.data;

      console.log("PayPal refund links:", refund.links);

      await prisma.refund.update({
        where: { referenceId: captureId },
        data: { status: "Completed" },
      });

      console.log("Refund created successfully:", refund);

      return refund;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw new Error("Failed to process PayPal refund.");
    }
  }
}
