import axios from "axios";
import PaymentServiceClient from "../../src/clients/paymentServiceClient";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("PaymentServiceClient", () => {
  const paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:8000/api/payments";

  describe("processPayment", () => {
    const userId = 1;
    const plan = "Premium";
    const paymentMethod = "Card";
    const amount = 50;
    const cookies = "authToken=mockToken";
    const type = "Subscription";

    it("should successfully process the payment", async () => {
      const mockResponse = { data: { success: true, message: "Payment successful" } };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await PaymentServiceClient.processPayment(
        userId,
        plan,
        paymentMethod,
        amount,
        cookies,
        type
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${paymentServiceUrl}/process`,
        { userId, plan, paymentMethod, amount, type },
        {
          withCredentials: true,
          headers: {
            Cookie: cookies,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error when payment fails due to server response", async () => {
      const mockError = {
        response: {
          data: { message: "Insufficient funds" },
          status: 402,
        },
        message: "Request failed with status code 402",
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        PaymentServiceClient.processPayment(
          userId,
          plan,
          paymentMethod,
          amount,
          cookies,
          type
        )
      ).rejects.toThrow("Payment processing failed.");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${paymentServiceUrl}/process`,
        { userId, plan, paymentMethod, amount, type },
        {
          withCredentials: true,
          headers: {
            Cookie: cookies,
          },
        }
      );
    });

    it("should throw an error when payment service is unreachable", async () => {
      const mockError = new Error("Network Error");

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        PaymentServiceClient.processPayment(
          userId,
          plan,
          paymentMethod,
          amount,
          cookies,
          type
        )
      ).rejects.toThrow("Payment processing failed.");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${paymentServiceUrl}/process`,
        { userId, plan, paymentMethod, amount, type },
        {
          withCredentials: true,
          headers: {
            Cookie: cookies,
          },
        }
      );
    });

    it("should handle missing cookies gracefully", async () => {
      const mockError = new Error("Unauthorized: Missing token");

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        PaymentServiceClient.processPayment(
          userId,
          plan,
          paymentMethod,
          amount,
          "",
          type
        )
      ).rejects.toThrow("Payment processing failed.");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${paymentServiceUrl}/process`,
        { userId, plan, paymentMethod, amount, type },
        {
          withCredentials: true,
          headers: {
            Cookie: "",
          },
        }
      );
    });
  });
});