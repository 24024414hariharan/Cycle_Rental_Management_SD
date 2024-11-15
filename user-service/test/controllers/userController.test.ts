import UserService from "../../src/services/userService";
import prisma from "../../src/clients/prisma";
import EmailServiceClient from "../../src/clients/EmailServiceClient";
import jwt from "jsonwebtoken";
import { AppError } from "../../src/middleware/errorHandler";
import bcrypt from "bcryptjs";

jest.mock("../../src/clients/prisma", () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest
    .fn()
    .mockResolvedValue("$2a$10$mockedHashedPassword1234567890mockHash"),
}));

jest.mock("../../src/clients/EmailServiceClient");
jest.mock("jsonwebtoken");

describe("UserService", () => {
  const mockUser = {
    email: "testuser@example.com",
    password: "SecurePass123!",
    name: "Test User",
    dateOfBirth: new Date("1990-01-01"),
    phoneNumber: "1234567890",
    identification: "ID123",
    isVerified: false,
  };

  const savedUser = {
    ...mockUser,
    password: "$2a$10$vMO0hIpbZay7lqymAmesieBRQJa3e697PSA575ba8Cc6BQwoth3lu", // Mock hashed password
    role: "Customer",
    id: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Prisma methods
    (prisma.user.create as jest.Mock).mockResolvedValue(savedUser);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(savedUser);
    (prisma.user.update as jest.Mock).mockResolvedValue({
      ...savedUser,
      isVerified: true,
    });

    // Mock JWT and EmailServiceClient
    (jwt.sign as jest.Mock).mockReturnValue("mockToken");
    (EmailServiceClient.sendVerificationEmail as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  describe("register", () => {
    it("should register a user and send a verification email", async () => {
      const result = await UserService.register(mockUser);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...mockUser,
          password: "$2a$10$mockedHashedPassword1234567890mockHash", // Mocked hashed password
          role: "Customer",
        },
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: savedUser.id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      expect(EmailServiceClient.sendVerificationEmail).toHaveBeenCalledWith(
        savedUser.email,
        expect.stringContaining("mockToken")
      );
      expect(result).toEqual(savedUser);
    });

    it("should throw an error if registration fails", async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error("Database Error")
      );

      await expect(UserService.register(mockUser)).rejects.toThrow(AppError);
      await expect(UserService.register(mockUser)).rejects.toThrow(
        "Registration failed. Please try again."
      );
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user by email", async () => {
      const result = await UserService.getUserByEmail(mockUser.email);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(savedUser);
    });

    it("should return null if user is not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserService.getUserByEmail(
        "nonexistent@example.com"
      );

      expect(result).toBeNull();
    });

    it("should throw an error if fetching user fails", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database Error")
      );

      await expect(UserService.getUserByEmail(mockUser.email)).rejects.toThrow(
        AppError
      );
      await expect(UserService.getUserByEmail(mockUser.email)).rejects.toThrow(
        "Failed to retrieve user by email."
      );
    });
  });

  describe("verifyEmail", () => {
    it("should verify a user's email", async () => {
      await UserService.verifyEmail(savedUser.id);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: savedUser.id },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: savedUser.id },
        data: { isVerified: true },
      });
    });

    it("should throw an error if user is already verified", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...savedUser,
        isVerified: true,
      });

      await expect(UserService.verifyEmail(savedUser.id)).rejects.toThrow(
        AppError
      );
      await expect(UserService.verifyEmail(savedUser.id)).rejects.toThrow(
        "Email verification failed. Please try again."
      );
    });

    it("should throw an error if user is not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(UserService.verifyEmail(savedUser.id)).rejects.toThrow(
        AppError
      );
      await expect(UserService.verifyEmail(savedUser.id)).rejects.toThrow(
        "Email verification failed. Please try again."
      );
    });
  });
});
