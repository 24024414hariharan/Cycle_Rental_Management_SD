import axios from "axios";

class SubscriptionServiceClient {
  private subscriptionServiceUrl =
    process.env.SUBSCRIPTION_SERVICE_URL ||
    "http://localhost:7000/api/subscription";

  async getSubscriptionStatus(userId: number) {
    try {
      const response = await axios.get(`${this.subscriptionServiceUrl}`, {
        withCredentials: true, 
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching subscription status:", error.message);
      throw new Error("Could not fetch subscription status.");
    }
  }

  async updateSubscription(
    userId: number,
    isActive: boolean,
    plan: "None" | "Basic",
    paymentMethod?: string
  ) {
    try {
      const response = await axios.put(
        `${this.subscriptionServiceUrl}`,
        { isActive, plan, paymentMethod },
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating subscription:", error.message);
      throw new Error("Could not update subscription.");
    }
  }
}

export default new SubscriptionServiceClient();
