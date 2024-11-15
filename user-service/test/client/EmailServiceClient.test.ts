import axios from "axios";
import EmailServiceClient from "../../src/clients/EmailServiceClient";
import { AppError } from "../../src/middleware/errorHandler";

jest.mock("axios");

describe("EmailServiceClient", () => {
  const emailServiceUrl = "http://localhost:4000/api/email/send-verification";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_SERVICE_URL = emailServiceUrl;
  });

  it("should send a verification email successfully", async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { message: "Email sent successfully" },
    });

    await EmailServiceClient.sendVerificationEmail(
      "test@example.com",
      "http://example.com/verify"
    );

    expect(axios.post).toHaveBeenCalledWith(emailServiceUrl, {
      to: "test@example.com",
      subject: "Email Verification",
      verificationUrl: "http://example.com/verify",
    });
  });

  it("should throw an AppError when the email service responds with an error", async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: "Invalid email address" },
      },
    });

    await expect(
      EmailServiceClient.sendVerificationEmail(
        "invalid-email",
        "http://example.com/verify"
      )
    ).rejects.toThrow(AppError);

    try {
      await EmailServiceClient.sendVerificationEmail(
        "invalid-email",
        "http://example.com/verify"
      );
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).message).toBe(
        "Email service responded with status 400: Invalid email address"
      );
      expect((error as AppError).statusCode).toBe(400);
    }
  });

  it("should throw an AppError when the email service is unreachable", async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    await expect(
      EmailServiceClient.sendVerificationEmail(
        "test@example.com",
        "http://example.com/verify"
      )
    ).rejects.toThrow(AppError);

    try {
      await EmailServiceClient.sendVerificationEmail(
        "test@example.com",
        "http://example.com/verify"
      );
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).message).toBe(
        "Email service is unreachable. Please try again later."
      );
      expect((error as AppError).statusCode).toBe(500);
    }
  });
});
