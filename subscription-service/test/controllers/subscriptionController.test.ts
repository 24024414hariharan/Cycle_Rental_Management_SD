import { Request, Response, NextFunction } from "express";
import * as subscriptionController from "../../src/controllers/subscriptionController";
import subscriptionService from "../../src/services/subscriptionService";
import { AppError } from "../../src/middleware/errorHandler";
import { SubscriptionStatusDTO } from "../../src/dtos/SubscriptionDTO";

jest.mock("../../src/services/subscriptionService");
const mockedSubscriptionService = jest.mocked(subscriptionService);

const mockRequest = (): Partial<Request> => ({
  user: { userId: 1 },
  body: {},
  headers: { cookie: "mock_cookie" },
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

const mockNext = () => jest.fn() as NextFunction;

describe("subscriptionController", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear any calls, instances, and results of mocks
  });
  describe("getSubscriptionStatus", () => {
    it("should retrieve subscription status successfully", async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const subscription: SubscriptionStatusDTO = {
        isActive: true,
        plan: "Basic",
        startDate: new Date(),
        endDate: null,
      };

      mockedSubscriptionService.getSubscriptionStatus.mockResolvedValue(
        subscription
      );

      await subscriptionController.getSubscriptionStatus(req, res, next);

      expect(
        mockedSubscriptionService.getSubscriptionStatus
      ).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Subscription status retrieved successfully.",
        data: subscription,
      });
    });

    it("should call next with an error if userId is missing", async () => {
      const req = mockRequest() as Request;
      req.user = undefined; // Simulate missing user
      const res = mockResponse() as Response;
      const next = mockNext();

      await subscriptionController.getSubscriptionStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Unauthorized: User information missing.", 401)
      );
    });

    it("should call next with an error if userId is missing in getSubscriptionStatus", async () => {
      const req = mockRequest() as Request;
      req.user = undefined; // Simulate missing user
      const res = mockResponse() as Response;
      const next = mockNext();
    
      await subscriptionController.getSubscriptionStatus(req, res, next);
    
      expect(next).toHaveBeenCalledWith(
        new AppError("Unauthorized: User information missing.", 401)
      );
    });
  });

  describe("updateSubscription", () => {
    it("should update subscription successfully", async () => {
      const req = mockRequest() as Request;
      req.body = {
        isActive: true,
        plan: "Basic",
        paymentMethod: "Credit Card",
      };
      const res = mockResponse() as Response;
      const next = mockNext();

      const updatedSubscription = {
        status: "success",
        paymentData: {
          isActive: true,
          plan: "Basic",
          startDate: new Date(),
          endDate: null,
        },
      };

      mockedSubscriptionService.updateSubscription.mockResolvedValue(
        updatedSubscription
      );

      await subscriptionController.updateSubscription(req, res, next);

      expect(mockedSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        1,
        { isActive: true, plan: "Basic", paymentMethod: "Credit Card" },
        "mock_cookie"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Subscription updated successfully.",
        data: updatedSubscription,
      });
    });

    it("should call next with an error if userId is missing", async () => {
      const req = mockRequest() as Request;
      req.user = undefined; // Simulate missing user
      const res = mockResponse() as Response;
      const next = mockNext();

      await subscriptionController.updateSubscription(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Unauthorized: User information missing.", 401)
      );
    });

    it("should call next with an error if userId is missing in updateSubscription", async () => {
      const req = mockRequest() as Request;
      req.user = undefined; // Simulate missing user
      req.body = { isActive: true, plan: "Basic", paymentMethod: "Credit Card" };
      const res = mockResponse() as Response;
      const next = mockNext();
    
      await subscriptionController.updateSubscription(req, res, next);
    
      expect(next).toHaveBeenCalledWith(
        new AppError("Unauthorized: User information missing.", 401)
      );
    });
  });

  describe("handleSubscriptionWebhook", () => {
    it("should update subscription status from webhook successfully", async () => {
      const req = mockRequest() as Request;
      req.body = { userId: 1, status: "active" };
      req.headers.cookie = "mock_cookie"; // Mock cookies in headers
      const res = mockResponse() as Response;
      const next = mockNext();

      mockedSubscriptionService.handleSubscriptionWebhook.mockResolvedValueOnce(
        undefined
      );

      await subscriptionController.handleSubscriptionWebhook(req, res, next);

      expect(
        mockedSubscriptionService.handleSubscriptionWebhook
      ).toHaveBeenCalledWith(1, "active", "mock_cookie");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Subscription status updated from webhook.",
      });
    });

    it("should handle error if userId or status is missing", async () => {
      const req = mockRequest() as Request;
      req.body = {}; // Missing userId and status
      const res = mockResponse() as Response;
      const next = mockNext();

      await subscriptionController.handleSubscriptionWebhook(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Invalid webhook payload: userId or status missing.", 400)
      );
    });

    it("should call next with an error if handleSubscriptionWebhook service fails", async () => {
      const req = mockRequest() as Request;
      req.body = { userId: 1, status: "inactive" };
      req.headers.cookie = "mock_cookie"; // Mock cookies in headers
      const res = mockResponse() as Response;
      const next = mockNext();
    
      const error = new AppError("Webhook processing failed", 500);
    
      mockedSubscriptionService.handleSubscriptionWebhook.mockRejectedValueOnce(
        error
      );
    
      await subscriptionController.handleSubscriptionWebhook(req, res, next);
    
      expect(next).toHaveBeenCalledWith(error);
    });
    
    it("should call next with an error if userId or status is missing in handleSubscriptionWebhook", async () => {
      const req = mockRequest() as Request;
      req.body = {}; // Missing userId and status
      const res = mockResponse() as Response;
      const next = mockNext();
    
      await subscriptionController.handleSubscriptionWebhook(req, res, next);
    
      expect(next).toHaveBeenCalledWith(
        new AppError("Invalid webhook payload: userId or status missing.", 400)
      );
    });
  });
});
