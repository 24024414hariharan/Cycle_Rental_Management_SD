import axios from "axios";

class PaymentServiceClient {
  private paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:8000/api/payments";

  async processPayment(
    userId: number,
    plan: string,
    paymentMethod: string,
    amount: number,
    cookies: string,
    type: string,
    transactionType: string
  ) {
    try {
      const response = await axios.post(
        `${this.paymentServiceUrl}/process`,
        { userId, plan, paymentMethod, amount, type, transactionType },
        {
          withCredentials: true,
          headers: {
            Cookie: cookies,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error processing payment:", error.message);
      throw new Error("Payment processing failed.");
    }
  }
}

export default new PaymentServiceClient();
