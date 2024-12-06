import axios from "axios";
import { PaymentServiceClient } from "../../src/clients/paymentServiceClient";
import { PaymentRequestDTO } from "../../src/dtos/UserRegistrationDTO";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("PaymentServiceClient", () => {
  const paymentServiceClient = new PaymentServiceClient();
  const paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:8000/api/payments";

  describe("processPayment", () => {
    const mockRequest: PaymentRequestDTO = {
      userId: 1,
      paymentMethod: "Card",
      amount: 100.0,
      type: "RENTAL",
      rentalId: 123,
      cookies: "authToken=mockToken",
      transactionType: "Payment",
    };

    it("should process payment successfully", async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await paymentServiceClient.processPayment(mockRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${paymentServiceUrl}/process`,
        {
          userId: mockRequest.userId,
          paymentMethod: mockRequest.paymentMethod,
          amount: mockRequest.amount,
          type: mockRequest.type,
          rentalID: mockRequest.rentalId,
          transactionType: mockRequest.transactionType,
        },
        { headers: { Cookie: mockRequest.cookies } }
      );
      expect(result).toEqual({ success: true });
    });

    it("should log and throw an error for failed payment due to API response error", async () => {
      const mockError = {
        response: {
          data: { message: "Insufficient funds" },
          status: 400,
        },
        message: "Request failed with status code 400",
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        paymentServiceClient.processPayment(mockRequest)
      ).rejects.toThrow("Payment processing failed. Please try again.");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${paymentServiceUrl}/process`,
        {
          userId: mockRequest.userId,
          paymentMethod: mockRequest.paymentMethod,
          amount: mockRequest.amount,
          type: mockRequest.type,
          rentalID: mockRequest.rentalId,
          transactionType: mockRequest.transactionType,
        },
        { headers: { Cookie: mockRequest.cookies } }
      );
    });

    it("should log and throw an error for unexpected failures", async () => {
      const mockError = new Error("Unexpected server error");
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        paymentServiceClient.processPayment(mockRequest)
      ).rejects.toThrow("Payment processing failed. Please try again.");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${paymentServiceUrl}/process`,
        {
          userId: mockRequest.userId,
          paymentMethod: mockRequest.paymentMethod,
          amount: mockRequest.amount,
          type: mockRequest.type,
          rentalID: mockRequest.rentalId,
          transactionType: mockRequest.transactionType,
        },
        { headers: { Cookie: mockRequest.cookies } }
      );
    });
  });
});
