import axios from "axios";

class SubscriptionServiceClient {
  private subscriptionServiceUrl =
    process.env.SUBSCRIPTION_SERVICE_URL ||
    "http://localhost:7000/api/subscription";

  async getSubscriptionStatus(userId: number) {
    try {
      const response = await axios.get(`${this.subscriptionServiceUrl}`, {
        withCredentials: true, // Include cookies in the request
      });
      return response.data.data; // Assuming the subscription status is in the `data` field
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
          withCredentials: true, // Include cookies in the request
        }
      );
      return response.data.data; // Assuming the updated subscription is in the `data` field
    } catch (error: any) {
      console.error("Error updating subscription:", error.message);
      throw new Error("Could not update subscription.");
    }
  }
}

export default new SubscriptionServiceClient();
