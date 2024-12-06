import axios from "axios";
import { PaymentRequestDTO } from "../dtos/cycldataDTO";

export class PaymentServiceClient {
  private paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:8000/api/payments";

  async processRefund(
    request: PaymentRequestDTO
  ): Promise<{ success: boolean }> {
    try {
      console.log(request.transactionID);
      const response = await axios.post(
        `${this.paymentServiceUrl}/process`,
        {
          userId: request.userId,
          paymentMethod: request.paymentMethod,
          amount: request.amount,
          type: request.type,
          rentalID: request.rentalId,
          transactionType: request.transactionType,
          transactionID: request.transactionID,
        },
        { headers: { Cookie: request.cookies } }
      );
      console.log("Payment API response:", response.data);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Payment processing failed:",
          error.response?.data || error.message
        );
      } else {
        console.error("Unexpected error:", error);
      }
      throw new Error("Payment processing failed. Please try again.");
    }
  }

  async processPayment(
    request: PaymentRequestDTO
  ): Promise<{ success: boolean }> {
    try {
      console.log(request.transactionType);
      const response = await axios.post(
        `${this.paymentServiceUrl}/process`,
        {
          userId: request.userId,
          paymentMethod: request.paymentMethod,
          amount: request.amount,
          type: request.type,
          rentalID: request.rentalId,
          transactionType: request.transactionType,
        },
        { headers: { Cookie: request.cookies } }
      );
      console.log("Payment API response:", response.data);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Payment processing failed:",
          error.response?.data || error.message
        );
      } else {
        console.error("Unexpected error:", error);
      }
      throw new Error("Payment processing failed. Please try again.");
    }
  }
}

export default new PaymentServiceClient();
