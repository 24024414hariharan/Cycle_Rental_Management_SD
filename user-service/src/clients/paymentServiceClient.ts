import axios from "axios";
import { PaymentRequestDTO } from "../dtos/UserRegistrationDTO";

export class PaymentServiceClient {
  private paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:8000/api/payments";

  async processPayment(
    request: PaymentRequestDTO
  ): Promise<{ success: boolean }> {
    try {
      const response = await axios.post(
        `${this.paymentServiceUrl}/process`,
        {
          userId: request.userId,
          paymentMethod: request.paymentMethod,
          amount: request.amount,
          type: request.type,
          rentalID: request.rentalId,
        },
        { headers: { Cookie: request.cookies } }
      );
      console.log("Payment API response:", response.data); // Log for debugging
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
