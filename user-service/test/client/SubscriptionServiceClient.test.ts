import axios from "axios";
import SubscriptionServiceClient from "../../src/clients/SubscriptionServiceClient";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SubscriptionServiceClient", () => {
  const subscriptionServiceUrl =
    process.env.SUBSCRIPTION_SERVICE_URL ||
    "http://localhost:7000/api/subscription";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSubscriptionStatus", () => {
    it("should fetch the subscription status successfully", async () => {
      const mockData = { data: { data: { status: "active" } } };
      mockedAxios.get.mockResolvedValue(mockData);

      const cookies = "sessionid=abc123";
      const userId = 1;
      const result = await SubscriptionServiceClient.getSubscriptionStatus(
        userId,
        cookies
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(subscriptionServiceUrl, {
        headers: { Cookie: cookies },
      });
      expect(result).toEqual(mockData.data.data);
    });

    it("should throw an error when the subscription status cannot be fetched", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Request failed"));

      const cookies = "sessionid=abc123";
      const userId = 1;

      await expect(
        SubscriptionServiceClient.getSubscriptionStatus(userId, cookies)
      ).rejects.toThrow("Could not fetch subscription status.");
      expect(mockedAxios.get).toHaveBeenCalledWith(subscriptionServiceUrl, {
        headers: { Cookie: cookies },
      });
    });
  });

  describe("updateSubscription", () => {
    it("should update the subscription successfully", async () => {
      const mockData = { data: { data: { success: true } } };
      mockedAxios.put.mockResolvedValue(mockData);

      const userId = 1;
      const isActive = true;
      const plan = "Basic";
      const paymentMethod = "CreditCard";
      const cookies = "sessionid=abc123";

      const result = await SubscriptionServiceClient.updateSubscription(
        userId,
        isActive,
        plan,
        paymentMethod,
        cookies
      );

      expect(mockedAxios.put).toHaveBeenCalledWith(
        subscriptionServiceUrl,
        { userId, isActive, plan, paymentMethod },
        {
          withCredentials: true,
          headers: { Cookie: cookies },
        }
      );
      expect(result).toEqual(mockData.data.data);
    });

    it("should throw an error when the subscription update fails", async () => {
      mockedAxios.put.mockRejectedValue(new Error("Request failed"));

      const userId = 1;
      const isActive = false;
      const plan = "None";
      const paymentMethod = "PayPal";
      const cookies = "sessionid=abc123";

      await expect(
        SubscriptionServiceClient.updateSubscription(
          userId,
          isActive,
          plan,
          paymentMethod,
          cookies
        )
      ).rejects.toThrow("Could not update subscription.");
      expect(mockedAxios.put).toHaveBeenCalledWith(
        subscriptionServiceUrl,
        { userId, isActive, plan, paymentMethod },
        {
          withCredentials: true,
          headers: { Cookie: cookies },
        }
      );
    });
  });
});
