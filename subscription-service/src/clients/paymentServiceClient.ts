import axios from "axios";

class PaymentServiceClient {
  private paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:8000/api/payments";

  async processPayment(
    userId: number,
    amount: number,
    paymentMethod: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await axios.post(`${this.paymentServiceUrl}/charge`, {
        userId,
        amount,
        paymentMethod,
      });
      return { success: response.data.success };
    } catch {
      return { success: false };
    }
  }
}

export default new PaymentServiceClient();
