import EmailService from "../../src/services/emailService";
// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";

jest.mock("sib-api-v3-sdk", () => ({
  ApiClient: {
    instance: {
      authentications: {
        "api-key": { apiKey: null },
      },
    },
  },
  TransactionalEmailsApi: jest.fn().mockImplementation(() => ({
    sendTransacEmail: jest.fn(),
  })),
}));

describe("EmailService", () => {
  let emailService: EmailService;

  beforeEach(() => {
    process.env.BREVO_API_KEY = "dummy_api_key";
    process.env.BREVO_FROM_EMAIL = "test@example.com";
    emailService = new EmailService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if BREVO_FROM_EMAIL is not set", () => {
    delete process.env.BREVO_FROM_EMAIL;
    expect(() => new EmailService()).toThrow(
      "BREVO_FROM_EMAIL is not set in environment variables."
    );
  });

  it("should throw an error for missing recipient email address", () => {
    expect(() =>
      (emailService as any).validateEmailParameters("", "Subject", "http://example.com")
    ).toThrow("Error: Recipient email address is required.");
  });

  it("should throw an error for missing subject", () => {
    expect(() =>
      (emailService as any).validateEmailParameters(
        "test@example.com",
        "",
        "http://example.com"
      )
    ).toThrow("Error: Email subject is required.");
  });

  it("should throw an error for invalid verification URL", () => {
    expect(() =>
      (emailService as any).validateEmailParameters(
        "test@example.com",
        "Subject",
        "invalid_url"
      )
    ).toThrow("Error: Invalid verification URL provided.");
  });

  it("should handle invalid URL in generateEmailTemplate", () => {
    expect(() =>
      (emailService as any).generateEmailTemplate("invalid_url")
    ).toThrow("Error: The provided verification URL is invalid: invalid_url");
  });

  it("should send an email successfully", async () => {
    const mockSendTransacEmail = jest.fn().mockResolvedValueOnce({});
    emailService["apiInstance"].sendTransacEmail = mockSendTransacEmail;

    await emailService.sendCustomEmail(
      "test@example.com",
      "Test Subject",
      "https://example.com/verify"
    );

    expect(mockSendTransacEmail).toHaveBeenCalledTimes(1);
  });

  it("should handle email sending errors", async () => {
    const mockSendTransacEmail = jest
      .fn()
      .mockRejectedValueOnce(new Error("API Error"));
    emailService["apiInstance"].sendTransacEmail = mockSendTransacEmail;

    await expect(
      emailService.sendCustomEmail(
        "test@example.com",
        "Test Subject",
        "https://example.com/verify"
      )
    ).rejects.toThrow("API Error");
  });

  it("should throw an error if both BREVO_API_KEY and BREVO_FROM_EMAIL are missing", () => {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_FROM_EMAIL;
  
    expect(() => new EmailService()).toThrow(
      "BREVO_API_KEY is not set in environment variables."
    );
  });
});
