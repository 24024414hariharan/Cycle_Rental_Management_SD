import axios from "axios";

class SubscriptionServiceClient {
  private subscriptionServiceUrl =
    process.env.SUBSCRIPTION_SERVICE_URL ||
    "http://localhost:7000/api/subscription";

  async getSubscriptionStatus(userId: number, cookies: string) {
    try {
      const response = await axios.get(`${this.subscriptionServiceUrl}`, {
        headers: {
          Cookie: cookies, // Include cookies in the headers
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error("Could not fetch subscription status.");
    }
  }

  async updateSubscription(
    userId: number,
    isActive: boolean,
    plan: "None" | "Basic",
    paymentMethod: string,
    cookies: string
  ) {
    try {
      const response = await axios.put(
        `${this.subscriptionServiceUrl}`,
        { userId, isActive, plan, paymentMethod },
        {
          withCredentials: true,
          headers: {
            Cookie: cookies,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error("Could not update subscription.");
    }
  }
}

export default new SubscriptionServiceClient();
