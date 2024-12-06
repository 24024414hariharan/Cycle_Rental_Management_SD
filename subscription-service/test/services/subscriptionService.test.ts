import prisma from "../../src/clients/prisma";
import subscriptionService from "../../src/services/subscriptionService";
import paymentServiceClient from "../../src/clients/paymentServiceClient";
import EmailServiceClient from "../../src/clients/EmailServiceClient";
import axios from "axios";
import { AppError } from "../../src/middleware/errorHandler";

jest.mock("../../src/clients/prisma", () => ({
  subscription: {
    findUnique: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
}));
jest.mock("../../src/clients/paymentServiceClient");
jest.mock("../../src/clients/EmailServiceClient");
jest.mock("axios");

const mockedPrisma = jest.mocked(prisma);
const mockedPaymentServiceClient = jest.mocked(paymentServiceClient);
const mockedEmailServiceClient = jest.mocked(EmailServiceClient);
const mockedAxios = jest.mocked(axios);

describe("SubscriptionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSubscriptionStatus", () => {
    it("should return subscription status when subscription exists", async () => {
      const mockSubscription = {
        id: 1,
        userId: 1,
        isActive: true,
        plan: "Basic",
        status: "Active",
        paymentMethod: null,
        startDate: new Date(),
        endDate: null,
        renewalDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedPrisma.subscription.findUnique.mockResolvedValueOnce(
        mockSubscription
      );

      const result = await subscriptionService.getSubscriptionStatus(1);

      expect(mockedPrisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(result).toEqual({
        isActive: true,
        plan: "Basic",
        startDate: mockSubscription.startDate,
        endDate: null,
      });
    });

    it("should update subscription to inactive if expired", async () => {
      const expiredSubscription = {
        id: 1,
        userId: 1,
        isActive: true,
        plan: "Basic",
        status: "Active",
        paymentMethod: null,
        startDate: new Date(),
        endDate: new Date(Date.now() - 1000),
        renewalDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedPrisma.subscription.findUnique.mockResolvedValueOnce(
        expiredSubscription
      );

      const result = await subscriptionService.getSubscriptionStatus(1);

      expect(mockedPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          isActive: false,
          plan: "None",
          startDate: null,
          endDate: null,
        },
      });
      expect(result).toEqual({
        isActive: false,
        plan: "None",
        startDate: null,
        endDate: null,
      });
    });

    it("should return default status if subscription does not exist", async () => {
      mockedPrisma.subscription.findUnique.mockResolvedValueOnce(null);

      const result = await subscriptionService.getSubscriptionStatus(1);

      expect(mockedPrisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(result).toEqual({
        isActive: false,
        plan: "None",
        startDate: null,
        endDate: null,
      });
    });
  });
  describe("updateSubscription", () => {
    it("should process payment and update subscription to pending", async () => {
      const mockPaymentResponse = { paymentId: "12345" };
      mockedPaymentServiceClient.processPayment.mockResolvedValueOnce(
        mockPaymentResponse
      );

      mockedPrisma.subscription.upsert.mockResolvedValueOnce({
        id: 1,
        userId: 1,
        isActive: false,
        plan: "Basic",
        status: "Pending",
        paymentMethod: "Credit Card",
        startDate: null,
        endDate: null,
        renewalDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await subscriptionService.updateSubscription(
        1,
        { isActive: true, plan: "Basic", paymentMethod: "Credit Card" },
        "mock_cookie"
      );

      expect(mockedPaymentServiceClient.processPayment).toHaveBeenCalledWith(
        1,
        "Basic",
        "Credit Card",
        20,
        "mock_cookie",
        "Subscription"
      );
      expect(result).toEqual({
        status: "pending",
        paymentData: mockPaymentResponse,
      });
    });

    it("should cancel subscription when isActive is false", async () => {
      mockedPrisma.subscription.update.mockResolvedValueOnce({
        id: 1,
        userId: 1,
        isActive: false,
        plan: "None",
        status: "Cancelled",
        paymentMethod: null,
        startDate: null,
        endDate: null,
        renewalDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await subscriptionService.updateSubscription(
        1,
        { isActive: false, plan: "None", paymentMethod: "Credit Card" },
        "mock_cookie"
      );

      expect(mockedPrisma.subscription.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          isActive: false,
          plan: "None",
          status: "Cancelled",
          startDate: null,
          endDate: null,
          paymentMethod: null,
        },
      });
      expect(result).toEqual({
        status: "cancelled",
      });
    });

    it("should throw error for invalid subscription plan", async () => {
      await expect(
        subscriptionService.updateSubscription(
          1,
          {
            isActive: true,
            plan: "InvalidPlan",
            paymentMethod: "Credit Card",
          } as any,
          "mock_cookie"
        )
      ).rejects.toThrow(AppError);
    });

    it("should throw error if payment method is missing for activation", async () => {
      await expect(
        subscriptionService.updateSubscription(
          1,
          { isActive: true, plan: "Basic", paymentMethod: undefined } as any,
          "mock_cookie"
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe("handleSubscriptionWebhook", () => {
    it("should activate a subscription on webhook success", async () => {
      const mockUser = {
        data: { data: { email: "test@example.com", name: "John Doe" } },
      };
      mockedAxios.get.mockResolvedValueOnce(mockUser);

      mockedPrisma.subscription.update.mockResolvedValueOnce({
        id: 1,
        userId: 1,
        isActive: true,
        plan: "Basic",
        status: "Active",
        paymentMethod: null,
        startDate: new Date(),
        endDate: new Date(),
        renewalDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await subscriptionService.handleSubscriptionWebhook(
        1,
        "Success",
        "mock_cookie"
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${process.env.USER_URL}/api/users/profile`,
        {
          withCredentials: true,
          headers: { cookie: "mock_cookie" },
        }
      );
      expect(mockedPrisma.subscription.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: expect.objectContaining({
          isActive: true,
          status: "Active",
        }),
      });
      expect(
        mockedEmailServiceClient.sendSubscriptionUpdate
      ).toHaveBeenCalledWith("test@example.com", "John Doe", "Success");
    });

    it("should deactivate a subscription on webhook failure", async () => {
      const mockUser = {
        data: { data: { email: "test@example.com", name: "John Doe" } },
      };
      mockedAxios.get.mockResolvedValueOnce(mockUser);

      mockedPrisma.subscription.update.mockResolvedValueOnce({
        id: 1,
        userId: 1,
        isActive: false,
        plan: "Basic",
        status: "Failed",
        paymentMethod: null,
        startDate: new Date(),
        endDate: new Date(),
        renewalDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await subscriptionService.handleSubscriptionWebhook(
        1,
        "Failed",
        "mock_cookie"
      );

      expect(mockedPrisma.subscription.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: expect.objectContaining({
          isActive: false,
          status: "Failed",
        }),
      });
      expect(
        mockedEmailServiceClient.sendSubscriptionUpdate
      ).toHaveBeenCalledWith("test@example.com", "John Doe", "Failed");
    });

    it("should throw error if webhook processing fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Axios error"));

      await expect(
        subscriptionService.handleSubscriptionWebhook(
          1,
          "Success",
          "mock_cookie"
        )
      ).rejects.toThrow(AppError);
    });
  });
});
