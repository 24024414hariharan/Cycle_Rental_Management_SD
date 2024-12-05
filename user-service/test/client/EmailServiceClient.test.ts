import axios from "axios";
import EmailServiceClient from "../../src/clients/EmailServiceClient";
import { AppError } from "../../src/middleware/errorHandler";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("EmailServiceClient", () => {
  const baseUrl = "http://localhost:4000/api/email/send-verification";
  process.env.EMAIL_SERVICE_URL = baseUrl;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendEmail", () => {
    it("should send an email successfully", async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const to = "test@example.com";
      const subject = "Test Email";
      const templateType = "testTemplate";
      const placeholders = { key: "value" };

      await EmailServiceClient.sendEmail(to, subject, templateType, placeholders);

      expect(mockedAxios.post).toHaveBeenCalledWith(baseUrl, {
        to,
        subject,
        templateType,
        placeholders,
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should throw AppError when email service responds with an error", async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: "Invalid email address" },
        },
      });

      const to = "invalid_email";
      const subject = "Test Email";
      const templateType = "testTemplate";
      const placeholders = { key: "value" };

      await expect(
        EmailServiceClient.sendEmail(to, subject, templateType, placeholders)
      ).rejects.toThrow(AppError);

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should throw AppError when email service is unreachable", async () => {
      mockedAxios.post.mockRejectedValue({});

      const to = "test@example.com";
      const subject = "Test Email";
      const templateType = "testTemplate";
      const placeholders = { key: "value" };

      await expect(
        EmailServiceClient.sendEmail(to, subject, templateType, placeholders)
      ).rejects.toThrow("Email service is unreachable. Please try again later.");

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("sendVerificationEmail", () => {
    it("should send a verification email", async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const to = "user@example.com";
      const verificationUrl = "http://example.com/verify";
      const name = "User";

      await EmailServiceClient.sendVerificationEmail(to, verificationUrl, name);

      expect(mockedAxios.post).toHaveBeenCalledWith(baseUrl, {
        to,
        subject: "Verify Your Email",
        templateType: "verification",
        placeholders: { url: verificationUrl, name },
      });
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send a password reset email", async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const to = "user@example.com";
      const resetUrl = "http://example.com/reset";
      const name = "User";

      await EmailServiceClient.sendPasswordResetEmail(to, resetUrl, name);

      expect(mockedAxios.post).toHaveBeenCalledWith(baseUrl, {
        to,
        subject: "Reset Your Password",
        templateType: "passwordReset",
        placeholders: { url: resetUrl, name },
      });
    });
  });

  describe("sendAccountDeletionEmail", () => {
    it("should send an account deletion email", async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const to = "user@example.com";
      const name = "User";

      await EmailServiceClient.sendAccountDeletionEmail(to, name);

      expect(mockedAxios.post).toHaveBeenCalledWith(baseUrl, {
        to,
        subject: "Account Deleted",
        templateType: "accountDeletion",
        placeholders: { name },
      });
    });
  });

  describe("sendAccountDeactivationEmail", () => {
    it("should send an account deactivation email", async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const to = "user@example.com";
      const name = "User";

      await EmailServiceClient.sendAccountDeactivationEmail(to, name);

      expect(mockedAxios.post).toHaveBeenCalledWith(baseUrl, {
        to,
        subject: "Account Deactivated",
        templateType: "accountDeactivation",
        placeholders: { name },
      });
    });
  });

  describe("sendRoleUpdateEmail", () => {
    it("should send a role update email", async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const to = "user@example.com";
      const name = "User";
      const role = "Admin";

      await EmailServiceClient.sendRoleUpdateEmail(to, name, role);

      expect(mockedAxios.post).toHaveBeenCalledWith(baseUrl, {
        to,
        subject: "Role Updated",
        templateType: "roleUpdate",
        placeholders: { name, role },
      });
    });
  });
});
