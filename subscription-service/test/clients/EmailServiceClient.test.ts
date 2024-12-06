import axios from "axios";
import axiosRetry from "axios-retry";
import EmailServiceClient from "../../src/clients/EmailServiceClient";
import { AppError } from "../../src/middleware/errorHandler";

jest.mock("axios");
jest.mock("axios-retry", () => jest.fn());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("EmailServiceClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const emailServiceUrl =
    process.env.EMAIL_SERVICE_URL ||
    "http://localhost:4000/api/email/send-verification";

  describe("sendEmail", () => {
    it("should send an email successfully", async () => {
      mockedAxios.post.mockResolvedValueOnce({});

      const to = "test@example.com";
      const subject = "Test Subject";
      const templateType = "testTemplate";
      const placeholders = { key: "value" };

      await EmailServiceClient.sendEmail(to, subject, templateType, placeholders);

      expect(mockedAxios.post).toHaveBeenCalledWith(emailServiceUrl, {
        to,
        subject,
        templateType,
        placeholders,
      });
    });

    it("should throw an AppError when the email service responds with an error", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
      });

      const to = "test@example.com";
      const subject = "Test Subject";
      const templateType = "testTemplate";
      const placeholders = { key: "value" };

      await expect(
        EmailServiceClient.sendEmail(to, subject, templateType, placeholders)
      ).rejects.toThrow(
        new AppError(
          "Email service responded with status 500: Internal Server Error",
          500
        )
      );
    });

    it("should throw an AppError when the email service is unreachable", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        message: "Network Error",
      });

      const to = "test@example.com";
      const subject = "Test Subject";
      const templateType = "testTemplate";
      const placeholders = { key: "value" };

      await expect(
        EmailServiceClient.sendEmail(to, subject, templateType, placeholders)
      ).rejects.toThrow(
        new AppError(
          "Email service is unreachable. Please try again later.",
          500
        )
      );
    });
  });

  describe("sendVerificationEmail", () => {
    it("should send a verification email successfully", async () => {
      mockedAxios.post.mockResolvedValueOnce({});

      const to = "user@example.com";
      const verificationUrl = "http://localhost:3000/verify";
      const name = "User";

      await EmailServiceClient.sendVerificationEmail(to, verificationUrl, name);

      expect(mockedAxios.post).toHaveBeenCalledWith(emailServiceUrl, {
        to,
        subject: "Verify Your Email",
        templateType: "verification",
        placeholders: {
          url: verificationUrl,
          name: name,
        },
      });
    });
  });

  describe("sendSubscriptionUpdate", () => {
    it("should send a subscription update email successfully", async () => {
      mockedAxios.post.mockResolvedValueOnce({});

      const to = "user@example.com";
      const name = "User";
      const status = "Active";

      await EmailServiceClient.sendSubscriptionUpdate(to, name, status);

      expect(mockedAxios.post).toHaveBeenCalledWith(emailServiceUrl, {
        to,
        subject: "Subscription Status Update",
        templateType: "subscriptionUpdate",
        placeholders: {
          name,
          status,
        },
      });
    });
  });

  it("should throw an AppError with statusText when response message is missing", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {}, // No `message` in response data
        statusText: "Not Found",
      },
    });

    const to = "test@example.com";
    const subject = "Test Subject";
    const templateType = "testTemplate";
    const placeholders = { key: "value" };

    await expect(
      EmailServiceClient.sendEmail(to, subject, templateType, placeholders)
    ).rejects.toThrow(
      new AppError(
        "Email service responded with status 404: Not Found",
        404
      )
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(emailServiceUrl, {
      to,
      subject,
      templateType,
      placeholders,
    });
  });
});
