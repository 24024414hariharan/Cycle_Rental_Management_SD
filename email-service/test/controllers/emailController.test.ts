import { Request, Response } from "express";
import { sendVerificationEmail } from "../../src/controllers/emailController";
import EmailService from "../../src/services/emailService";

jest.mock("../../src/services/emailService");

describe("sendVerificationEmail", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let emailServiceMock: jest.Mocked<EmailService>;

  beforeEach(() => {
    emailServiceMock = new EmailService() as jest.Mocked<EmailService>;

    mockReq = {
      body: {
        to: "test@example.com",
        subject: "Test Subject",
        verificationUrl: "http://example.com/verify",
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should return 400 if required fields are missing", async () => {
    mockReq.body = { to: "test@example.com" }; // Missing fields

    await sendVerificationEmail(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing required fields",
    });
  });

  it("should return 400 if the verification URL is invalid", async () => {
    mockReq.body.verificationUrl = "invalid-url"; // Invalid URL

    await sendVerificationEmail(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid verification URL",
    });
  });

  it("should return 200 if the email is sent successfully", async () => {
    const sendEmailMock = jest.spyOn(EmailService.prototype, "sendCustomEmail").mockResolvedValueOnce(undefined);

    await sendVerificationEmail(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Verification email sent successfully",
    });
    expect(sendEmailMock).toHaveBeenCalledWith(
      "test@example.com",
      "Test Subject",
      "http://example.com/verify"
    );
  });

  it("should return 502 if the email service responds with an error", async () => {
    const error = {
      response: {
        data: "Email service unavailable",
      },
    };
    jest.spyOn(EmailService.prototype, "sendCustomEmail").mockRejectedValueOnce(error);

    await sendVerificationEmail(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(502);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Failed to send email: Email service unavailable",
    });
  });

  it("should return 500 if an unexpected error occurs", async () => {
    jest.spyOn(EmailService.prototype, "sendCustomEmail").mockRejectedValueOnce(new Error("Unexpected error"));

    await sendVerificationEmail(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Error sending verification email",
    });
  });
});
