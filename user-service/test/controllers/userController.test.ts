import { Request, Response, NextFunction } from "express";
import * as userController from "../../src/controllers/userController";
import userService from "../../src/services/userService";
import subscriptionServiceClient from "../../src/clients/SubscriptionServiceClient";
import { AppError } from "../../src/middleware/errorHandler";
import { validationResult } from "express-validator";
import { generateSessionToken } from "../../src/utils/tokenUtil";
import { PaymentServiceClient } from "../../src/clients/paymentServiceClient";
import cycleServiceClient from "../../src/clients/CycleServiceClient";

jest.mock("../../src/services/userService");
jest.mock("../../src/clients/SubscriptionServiceClient");
jest.mock("../../src/utils/tokenUtil");
jest.mock("express-validator");

const mockedUserService = jest.mocked(userService);
const mockedSubscriptionClient = jest.mocked(subscriptionServiceClient);
const mockedGenerateSessionToken = jest.mocked(generateSessionToken);
const mockedValidationResult = jest.mocked(validationResult);

describe("userController", () => {
  const mockRequest = () => {
    const req: Partial<Request> = {};
    req.body = {};
    req.query = {};
    req.headers = {};
    req.user = {} as any;
    return req as Request;
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    res.cookie = jest.fn().mockReturnThis();
    res.clearCookie = jest.fn().mockReturnThis();
    return res as Response;
  };

  const mockNext = () => jest.fn() as NextFunction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a user successfully", async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => true } as any);
      mockedUserService.register.mockResolvedValue(undefined);

      const req = mockRequest();
      req.body = { email: "test@example.com", password: "password123" };
      const res = mockResponse();
      const next = mockNext();

      await userController.register(req, res, next);

      expect(mockedUserService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "User registered successfully. Please check your email for verification.",
      });
    });

    it("should handle validation errors", async () => {
      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Invalid input" }],
      } as any);

      const req = mockRequest();
      req.body = {};
      const res = mockResponse();
      const next = mockNext();

      await userController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with an error if registration fails", async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => true } as any);
      mockedUserService.register.mockRejectedValue(
        new Error("Registration failed")
      );

      const req = mockRequest();
      req.body = { email: "test@example.com", password: "password123" };
      const res = mockResponse();
      const next = mockNext();

      await userController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should call next with an error when validationResult fails", async () => {
      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Invalid input" }],
      } as any);

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await userController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
    
    it("should call next with a validation error when validationResult fails", async () => {
      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Invalid input" }],
      } as any);
    
      const req = mockRequest();
      req.body = {};
      const res = mockResponse();
      const next = mockNext();
    
      await userController.register(req, res, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      mockedUserService.verifyEmailToken.mockResolvedValue(undefined);
  
      const req = mockRequest();
      req.query = { token: "mockToken" };
      const res = mockResponse();
      const next = mockNext();
  
      await userController.verifyEmail(req, res, next);
  
      expect(mockedUserService.verifyEmailToken).toHaveBeenCalledWith("mockToken");
      expect(res.json).toHaveBeenCalledWith({
        message: "Email verified successfully.",
      });
    });
  
    it("should call next with a generic Error if email verification fails", async () => {
      const error = new Error("Verification failed");
      mockedUserService.verifyEmailToken.mockRejectedValue(error);
  
      const req = mockRequest();
      req.query = { token: "mockToken" };
      const res = mockResponse();
      const next = mockNext();
  
      await userController.verifyEmail(req, res, next);
  
      expect(next).toHaveBeenCalledWith(error);
    });
  
    it("should call next with a generic Error if token is missing", async () => {
      const req = mockRequest();
      req.query = {};
      const res = mockResponse();
      const next = mockNext();
  
      await userController.verifyEmail(req, res, next);
  
      expect(next).toHaveBeenCalledWith(new Error("Verification failed"));
    });
  });

  describe("updateRole", () => {
    it("should update user role successfully", async () => {
      mockedUserService.updateUserRole.mockResolvedValue(undefined);

      const req = mockRequest();
      req.body = { userId: 1, role: "ADMIN" };
      const res = mockResponse();
      const next = mockNext();

      await userController.updateRole(req, res, next);

      expect(mockedUserService.updateUserRole).toHaveBeenCalledWith(1, "ADMIN");
      expect(res.json).toHaveBeenCalledWith({
        message: "User role updated successfully.",
      });
    });

    it("should call next with an error if role update fails", async () => {
      mockedUserService.updateUserRole.mockRejectedValue(
        new Error("Role update failed")
      );

      const req = mockRequest();
      req.body = { userId: 1, role: "ADMIN" };
      const res = mockResponse();
      const next = mockNext();

      await userController.updateRole(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("closeAccount", () => {
    it("should close account successfully", async () => {
      mockedUserService.deleteAccount.mockResolvedValue(undefined);

      const req = mockRequest();
      req.user = { userId: 1 };
      req.body = { confirmation: "CLOSE" };
      const res = mockResponse();
      const next = mockNext();

      await userController.closeAccount(req, res, next);

      expect(mockedUserService.deleteAccount).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Account closed successfully. We're sad to see you go!",
      });
    });

    it("should call next with an error if confirmation is invalid", async () => {
      const req = mockRequest();
      req.body = { confirmation: "WRONG" };
      const res = mockResponse();
      const next = mockNext();

      await userController.closeAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("deactivateAccount", () => {
    it("should deactivate user account successfully", async () => {
      mockedUserService.deactivateUser.mockResolvedValue(undefined);

      const req = mockRequest();
      req.body = { userId: 1 };
      const res = mockResponse();
      const next = mockNext();

      await userController.deactivateAccount(req, res, next);

      expect(mockedUserService.deactivateUser).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "User account deactivated successfully.",
      });
    });

    it("should call next with an error if deactivation fails", async () => {
      mockedUserService.deactivateUser.mockRejectedValue(
        new Error("Deactivation failed")
      );

      const req = mockRequest();
      req.body = { userId: 1 };
      const res = mockResponse();
      const next = mockNext();

      await userController.deactivateAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle deactivation errors", async () => {
      mockedUserService.deactivateUser.mockRejectedValue(
        new Error("Deactivation failed")
      );

      const req = mockRequest();
      req.body = { userId: 1 };
      const res = mockResponse();
      const next = mockNext();

      await userController.deactivateAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should call next with an error if deactivation fails", async () => {
      mockedUserService.deactivateUser.mockRejectedValue(
        new Error("Deactivation failed")
      );

      const req = mockRequest();
      req.body = { userId: 1 };
      const res = mockResponse();
      const next = mockNext();

      await userController.deactivateAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should call next with an Error when deactivation fails", async () => {
      mockedUserService.deactivateUser.mockRejectedValue(new Error("Deactivation failed"));
    
      const req = mockRequest();
      req.body = { userId: 1 };
      const res = mockResponse();
      const next = mockNext();
    
      await userController.deactivateAccount(req, res, next);
    
      expect(next).toHaveBeenCalledWith(new Error("Deactivation failed"));
    });
    
  });

  describe("getProfile", () => {
    it("should fetch user profile successfully", async () => {
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        phoneNumber: "1234567890",
      } as any;

      mockedUserService.getUserById.mockResolvedValue(mockUser);

      const req = mockRequest();
      req.user = { userId: 1 };
      const res = mockResponse();
      const next = mockNext();

      await userController.getProfile(req, res, next);

      expect(mockedUserService.getUserById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          name: mockUser.name,
          email: mockUser.email,
          phoneNumber: mockUser.phoneNumber,
        },
      });
    });

    it("should handle unauthorized error if user is not logged in", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await userController.getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should handle error if user is not found", async () => {
      mockedUserService.getUserById.mockResolvedValue(null);

      const req = mockRequest();
      req.user = { userId: 1 };
      const res = mockResponse();
      const next = mockNext();

      await userController.getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const mockUpdatedUser = {
        name: "Updated User",
        email: "updated@example.com",
      };

      mockedUserService.updateUser.mockResolvedValue(mockUpdatedUser);

      const req = mockRequest();
      req.user = { userId: 1 };
      req.body = { name: "Updated User", email: "updated@example.com" };
      const res = mockResponse();
      const next = mockNext();

      await userController.updateProfile(req, res, next);

      expect(mockedUserService.updateUser).toHaveBeenCalledWith(1, {
        name: "Updated User",
        email: "updated@example.com",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Profile updated successfully.",
        data: { name: "Updated User", email: "updated@example.com" },
      });
    });

    it("should handle error if no valid fields are provided", async () => {
      const req = mockRequest();
      req.user = { userId: 1 };
      req.body = {};
      const res = mockResponse();
      const next = mockNext();

      await userController.updateProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with an error if update fails", async () => {
      mockedUserService.updateUser.mockRejectedValue(
        new Error("Update failed")
      );

      const req = mockRequest();
      req.user = { userId: 1 };
      req.body = { name: "Updated User" };
      const res = mockResponse();
      const next = mockNext();

      await userController.updateProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("login", () => {
    it("should handle invalid credentials", async () => {
      mockedUserService.getUserByEmail.mockResolvedValue(null);

      const req = mockRequest();
      req.body = { email: "invalid@example.com", password: "wrongPassword" };
      const res = mockResponse();
      const next = mockNext();

      await userController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should handle email not verified", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        isVerified: false,
        role: "USER",
      } as any;

      mockedUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockedUserService.comparePasswords.mockResolvedValue(true);

      const req = mockRequest();
      req.body = { email: "test@example.com", password: "password123" };
      const res = mockResponse();
      const next = mockNext();

      await userController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with an error if password comparison fails", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        isVerified: true,
        role: "USER",
      } as any;

      mockedUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockedUserService.comparePasswords.mockResolvedValue(false);

      const req = mockRequest();
      req.body = { email: "test@example.com", password: "wrongPassword" };
      const res = mockResponse();
      const next = mockNext();

      await userController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with an AppError if password is incorrect", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        isVerified: true,
        role: "USER",
      } as any;
    
      mockedUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockedUserService.comparePasswords.mockResolvedValue(false);
    
      const req = mockRequest();
      req.body = { email: "test@example.com", password: "wrongPassword" };
      const res = mockResponse();
      const next = mockNext();
    
      await userController.login(req, res, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
    
  });

  describe("logout", () => {
    it("should handle user not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await userController.logout(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with an error if user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await userController.logout(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with an AppError when user is not authenticated during logout", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
    
      await userController.logout(req, res, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
    
  });

  describe("getSubscriptionStatus", () => {
    it("should handle errors when retrieving subscription status", async () => {
      mockedSubscriptionClient.getSubscriptionStatus.mockRejectedValue(
        new Error("Service error")
      );

      const req = mockRequest();
      req.user = { userId: 1 };
      req.headers.cookie = "mock_cookie";
      const res = mockResponse();
      const next = mockNext();

      await userController.getSubscriptionStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should call next with an error if subscription retrieval fails", async () => {
      mockedSubscriptionClient.getSubscriptionStatus.mockRejectedValue(
        new Error("Service error")
      );

      const req = mockRequest();
      req.user = { userId: 1 };
      req.headers.cookie = "mock_cookie";
      const res = mockResponse();
      const next = mockNext();

      await userController.getSubscriptionStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should call next with an Error when subscription retrieval fails", async () => {
      mockedSubscriptionClient.getSubscriptionStatus.mockRejectedValue(new Error("Service error"));
    
      const req = mockRequest();
      req.user = { userId: 1 };
      req.headers.cookie = "mock_cookie";
      const res = mockResponse();
      const next = mockNext();
    
      await userController.getSubscriptionStatus(req, res, next);
    
      expect(next).toHaveBeenCalledWith(new Error("Service error"));
    });    
  });

  describe("updateSubscription", () => {
    it("should handle errors when updating subscription", async () => {
      mockedSubscriptionClient.updateSubscription.mockRejectedValue(
        new Error("Update failed")
      );

      const req = mockRequest();
      req.user = { userId: 1 };
      req.body = { isActive: true, plan: "Basic", paymentMethod: "Card" };
      req.headers.cookie = "mock_cookie";
      const res = mockResponse();
      const next = mockNext();

      await userController.updateSubscription(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle unauthorized access", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await userController.updateSubscription(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with an error if subscription update fails", async () => {
      mockedSubscriptionClient.updateSubscription.mockRejectedValue(
        new Error("Update failed")
      );

      const req = mockRequest();
      req.user = { userId: 1 };
      req.body = { isActive: true, plan: "Basic", paymentMethod: "Card" };
      req.headers.cookie = "mock_cookie";
      const res = mockResponse();
      const next = mockNext();

      await userController.updateSubscription(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should call next with an Error when subscription update fails", async () => {
      mockedSubscriptionClient.updateSubscription.mockRejectedValue(new Error("Update failed"));
    
      const req = mockRequest();
      req.user = { userId: 1 };
      req.body = { isActive: true, plan: "Basic", paymentMethod: "Card" };
      req.headers.cookie = "mock_cookie";
      const res = mockResponse();
      const next = mockNext();
    
      await userController.updateSubscription(req, res, next);
    
      expect(next).toHaveBeenCalledWith(new Error("Update failed"));
    });    
  });

  describe("calculateFare", () => {
    it("should calculate fare successfully", async () => {
      const mockFare = { total: 100 };
      const req = mockRequest();
      req.body = { cycleId: 1, rentalHours: 2 };
      req.headers.cookie = "authToken=mockToken";
      const res = mockResponse();
      const next = mockNext();
  
      jest.spyOn(cycleServiceClient, "calculateFare").mockResolvedValueOnce(mockFare);
  
      await userController.calculateFare(req, res, next);
  
      expect(cycleServiceClient.calculateFare).toHaveBeenCalledWith(
        1,
        2,
        "authToken=mockToken"
      );
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Fare calculated successfully.",
        data: mockFare,
      });
    });
  
    it("should handle missing cookies for calculating fare", async () => {
      const req = mockRequest();
      req.body = { cycleId: 1, rentalHours: 2 };
      req.headers.cookie = undefined;
      const res = mockResponse();
      const next = mockNext();
  
      await userController.calculateFare(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized: Missing token",
      });
    });
  
    it("should call next with error if calculateFare fails", async () => {
      const req = mockRequest();
      req.body = { cycleId: 1, rentalHours: 2 };
      req.headers.cookie = "authToken=mockToken";
      const res = mockResponse();
      const next = mockNext();
  
      jest.spyOn(cycleServiceClient, "calculateFare").mockRejectedValueOnce(new Error("Fare calculation failed"));
  
      await userController.calculateFare(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("payForRental", () => {
    it("should process rental payment successfully", async () => {
      const mockRentalDetails = { totalFare: 100 };
      const req = mockRequest();
      req.body = { rentalId: 123, paymentMethod: "Card" };
      req.user = { userId: 1 };
      req.headers.cookie = "authToken=mockToken";
      const res = mockResponse();
      const next = mockNext();
  
      jest.spyOn(cycleServiceClient, "getUserRentalDetails").mockResolvedValueOnce(mockRentalDetails);
      jest.spyOn(PaymentServiceClient.prototype, "processPayment").mockResolvedValueOnce({ success: true });
  
      await userController.payForRental(req, res, next);
  
      expect(cycleServiceClient.getUserRentalDetails).toHaveBeenCalledWith(123, "authToken=mockToken");
      expect(PaymentServiceClient.prototype.processPayment).toHaveBeenCalledWith({
        userId: 1,
        paymentMethod: "Card",
        amount: 100,
        cookies: "authToken=mockToken",
        type: "Cycle rental",
        rentalId: 123,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Payment has been initiated. Rental status will be notified by mail",
      });
    });
  
    it("should return 401 if user is not authenticated", async () => {
      const req = mockRequest();
      req.body = { rentalId: 123, paymentMethod: "Card" };
      req.headers.cookie = "authToken=mockToken";
      const res = mockResponse();
      const next = mockNext();
  
      await userController.payForRental(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  
    it("should handle missing required fields", async () => {
      const req = mockRequest();
      req.body = {};
      req.user = { userId: 1 };
      req.headers.cookie = "authToken=mockToken";
      const res = mockResponse();
      const next = mockNext();
  
      await userController.payForRental(req, res, next);
  
      expect(next).toHaveBeenCalledWith(
        new AppError("Missing required fields: rentalId, calculatedFare, or paymentMethod.", 400)
      );
    });
  
    it("should call next with error if rental details retrieval fails", async () => {
      const req = mockRequest();
      req.body = { rentalId: 123, paymentMethod: "Card" };
      req.user = { userId: 1 };
      req.headers.cookie = "authToken=mockToken";
      const res = mockResponse();
      const next = mockNext();
  
      jest.spyOn(cycleServiceClient, "getUserRentalDetails").mockRejectedValueOnce(new Error("Rental details not found"));
  
      await userController.payForRental(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  
    it("should call next with error if payment processing fails", async () => {
      const mockRentalDetails = { totalFare: 100 };
      const req = mockRequest();
      req.body = { rentalId: 123, paymentMethod: "Card" };
      req.user = { userId: 1 };
      req.headers.cookie = "authToken=mockToken";
      const res = mockResponse();
      const next = mockNext();
  
      jest.spyOn(cycleServiceClient, "getUserRentalDetails").mockResolvedValueOnce(mockRentalDetails);
      jest.spyOn(PaymentServiceClient.prototype, "processPayment").mockRejectedValueOnce(new Error("Payment failed"));
  
      await userController.payForRental(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
  
});
