import prisma from "../../src/clients/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../../src/middleware/errorHandler";
import {
  verifyToken,
  generateVerificationToken,
  generateSessionToken,
} from "../../src/utils/tokenUtil";
import EmailServiceClient from "../../src/clients/EmailServiceClient";
import UserService from "../../src/services/userService";
import { Role } from "@prisma/client";
import { IUserRegistrationData } from "../../src/dtos/UserRegistrationDTO";
import { UserFactoryProvider } from "../../src/factories/userFactory";

jest.mock("../../src/clients/prisma", () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockCreateUser = jest.fn(() =>
  Promise.resolve({
    id: 1,
    email: "testuser@example.com",
    name: "Test User",
    role: "CUSTOMER",
  })
);

jest.mock("../../src/factories/userFactory", () => ({
  UserFactoryProvider: {
    getFactory: jest.fn(() => ({
      createUser: mockCreateUser,
    })),
  },
}));


jest.mock("../../src/utils/tokenUtil", () => ({
  verifyToken: jest.fn(),
  generateVerificationToken: jest.fn(),
  generateSessionToken: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../../src/clients/EmailServiceClient", () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendAccountDeletionEmail: jest.fn(),
  sendAccountDeactivationEmail: jest.fn(),
  sendRoleUpdateEmail: jest.fn(),
}));

describe("UserService", () => {
  const mockUser = {
    id: 1,
    email: "testuser@example.com",
    password: "SecurePass123!",
    name: "Test User",
    dateOfBirth: new Date("1990-01-01"),
    phoneNumber: "1234567890",
    identification: "ID12345",
    isVerified: false,
    isActive: true,
    role: Role.CUSTOMER,
    passwordResetToken: "mockResetToken",
    passwordResetExpires: new Date(Date.now() + 3600 * 1000),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.update as jest.Mock).mockResolvedValue({
      ...mockUser,
      isVerified: true,
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (verifyToken as jest.Mock).mockReturnValue({ userId: mockUser.id });
    (generateVerificationToken as jest.Mock).mockReturnValue("mockToken");
  });

  describe("register", () => {
    it("should default role to CUSTOMER if not provided", async () => {
      const userWithoutRole: IUserRegistrationData = {
        email: "testuser@example.com",
        name: "Test User",
        dateOfBirth: "1990-01-01" as any,
        phoneNumber: "1234567890",
        password: "SecurePass123!",
        identification: "ID12345",
      };
  
      console.log("Test input for register:", userWithoutRole);
  
      await UserService.register(userWithoutRole);

      expect(UserFactoryProvider.getFactory).toHaveBeenCalledWith("CUSTOMER");

      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({"dateOfBirth": "1990-01-01", "email": "testuser@example.com", "identification": "ID12345", "name": "Test User", "password": "SecurePass123!", "phoneNumber": "1234567890"})
      );

      expect(EmailServiceClient.sendVerificationEmail).toHaveBeenCalledWith(
        "testuser@example.com",
        expect.any(String),
        "Test User"
      );
    });
  });
  
  
  
  

  describe("resetPassword", () => {
    it("should throw an error if user has no reset token", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordResetToken: null,
      });

      await expect(
        UserService.resetPassword("mockToken", "NewPassword123!")
      ).rejects.toThrow("Invalid or expired reset token.");
    });

    it("should throw an error if the reset token is expired", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordResetExpires: new Date(Date.now() - 1000),
      });

      await expect(
        UserService.resetPassword("mockToken", "NewPassword123!")
      ).rejects.toThrow("Invalid or expired reset token.");
    });
  });

  describe("updateUser", () => {
    it("should convert dateOfBirth from string to Date", async () => {
      const updateData = { dateOfBirth: "1990-01-01" };
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        dateOfBirth: new Date("1990-01-01"),
      });

      const result = await UserService.updateUser(mockUser.id, updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { dateOfBirth: new Date("1990-01-01") },
      });
      expect(result.dateOfBirth).toEqual(new Date("1990-01-01"));
    });
  });

  describe("getUserByEmail", () => {
    it("should fetch a user by email", async () => {
      const user = await UserService.getUserByEmail(mockUser.email);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(user).toEqual(mockUser);
    });

    it("should return null if the user is not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const user = await UserService.getUserByEmail("unknown@example.com");

      expect(user).toBeNull();
    });

    it("should throw an AppError if fetching user fails", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new AppError("Failed to fetch user.", 500)
      );

      await expect(UserService.getUserByEmail(mockUser.email)).rejects.toThrow(
        AppError
      );
      await expect(UserService.getUserByEmail(mockUser.email)).rejects.toThrow(
        "Failed to fetch user."
      );
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send a password reset email if the user exists", async () => {
      await UserService.sendPasswordResetEmail(mockUser.email);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          passwordResetToken: "mockToken",
        }),
      });
      expect(EmailServiceClient.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.stringContaining("mockToken"),
        mockUser.name
      );
    });

    it("should not send an email if the user does not exist", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await UserService.sendPasswordResetEmail("unknown@example.com");

      expect(EmailServiceClient.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("should reset the password if the token is valid", async () => {
      const newPassword = "NewPassword123!";

      await UserService.resetPassword(mockUser.passwordResetToken, newPassword);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          password: "hashedPassword",
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
    });

    it("should throw an error if the token is invalid or expired", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordResetToken: null,
        passwordResetExpires: new Date(Date.now() - 1000),
      });

      await expect(
        UserService.resetPassword("mockToken", "NewPassword123!")
      ).rejects.toThrow("Invalid or expired reset token.");
    });
  });

  describe("updateUserRole", () => {
    it("should update the user's role", async () => {
      await UserService.updateUserRole(mockUser.id, "ADMIN");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { role: "ADMIN" },
      });
      expect(EmailServiceClient.sendRoleUpdateEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
        "ADMIN"
      );
    });

    it("should throw an error for invalid roles", async () => {
      await expect(
        UserService.updateUserRole(mockUser.id, "INVALID_ROLE")
      ).rejects.toThrow("Invalid role.");
    });
  });

  describe("deactivateUser", () => {
    it("should deactivate the user account if active", async () => {
      await UserService.deactivateUser(mockUser.id);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { isActive: false },
      });
      expect(
        EmailServiceClient.sendAccountDeactivationEmail
      ).toHaveBeenCalledWith(mockUser.email, mockUser.name);
    });

    it("should throw an error if the user is already deactivated", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(UserService.deactivateUser(mockUser.id)).rejects.toThrow(
        "User is already deactivated."
      );
    });
  });

  describe("deleteAccount", () => {
    it("should delete the user account if it exists", async () => {
      await UserService.deleteAccount(mockUser.id);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(EmailServiceClient.sendAccountDeletionEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name
      );
    });

    it("should throw an AppError if the user is not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(UserService.deleteAccount(mockUser.id)).rejects.toThrow(
        AppError
      );
      await expect(UserService.deleteAccount(mockUser.id)).rejects.toThrow(
        "User not found."
      );
    });
  });

  describe("verifyEmailToken", () => {
    it("should verify a user's email if the token is valid", async () => {
      await UserService.verifyEmailToken("mockToken");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { isVerified: true },
      });
    });

    it("should throw an error if the user is already verified", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isVerified: true,
      });

      await expect(UserService.verifyEmailToken("mockToken")).rejects.toThrow(
        "Email is already verified."
      );
    });
  });

  describe("updateUser", () => {
    it("should update the user with valid data", async () => {
      const updateData = { name: "Updated Name", phoneNumber: "9876543210" };
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await UserService.updateUser(mockUser.id, updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateData,
      });
      expect(result).toEqual(expect.objectContaining(updateData));
    });

    it("should throw an error if the user is not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const updateData = { name: "Updated Name" };

      await expect(
        UserService.updateUser(mockUser.id, updateData)
      ).rejects.toThrow("User not found.");
    });

    it("should resolve with existing user data if invalid fields are provided", async () => {
      const invalidData = { invalidField: "Invalid" } as any;
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserService.updateUser(mockUser.id, invalidData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: invalidData,
      });
      expect(result).toEqual({
        name: mockUser.name,
        email: mockUser.email,
        phoneNumber: mockUser.phoneNumber,
        dateOfBirth: mockUser.dateOfBirth,
      });
    });
  });
});
