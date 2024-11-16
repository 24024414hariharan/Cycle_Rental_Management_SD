// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  private apiInstance: any;

  constructor() {
    this.initializeApiInstance();
  }

  private initializeApiInstance() {
    const client = SibApiV3Sdk.ApiClient.instance;
    const apiKey = client.authentications["api-key"];

    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not set in environment variables.");
    }

    if (!process.env.BREVO_FROM_EMAIL) {
      throw new Error("BREVO_FROM_EMAIL is not set in environment variables.");
    }

    apiKey.apiKey = process.env.BREVO_API_KEY;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  private validateEmailParameters(
    to: string,
    subject: string,
    verificationUrl: string
  ) {
    if (!to) {
      throw new Error("Error: Recipient email address is required.");
    }

    if (!subject) {
      throw new Error("Error: Email subject is required.");
    }

    if (!verificationUrl || !/^https?:\/\//.test(verificationUrl)) {
      throw new Error("Error: Invalid verification URL provided.");
    }
  }

  private generateEmailTemplate(verificationUrl: string): string {
    try {
      new URL(verificationUrl);
    } catch {
      throw new Error(
        `Error: The provided verification URL is invalid: ${verificationUrl}`
      );
    }

    return `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; padding: 20px; font-size: 24px; color: #4CAF50; }
          .content { font-size: 16px; line-height: 1.6; }
          .button { display: inline-block; margin: 20px 0; padding: 12px 24px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Welcome to Cycle Rental System!</div>
          <div class="content">
            <p>Hi there,</p>
            <p>Thank you for signing up for the Cycle Rental System! To complete your registration, please verify your email by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Your Email</a>
            </p>
            <p>If the button above doesn’t work, please copy and paste the following link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>Welcome aboard, and happy cycling!</p>
            <p>Best regards,<br>The Cycle Rental System Team</p>
          </div>
          <div class="footer">
            © 2024 Cycle Rental System. All rights reserved.
          </div>
        </div>
      </body>
      </html>`;
  }

  async sendCustomEmail(to: string, subject: string, verificationUrl: string) {
    this.validateEmailParameters(to, subject, verificationUrl);

    const emailTemplate = this.generateEmailTemplate(verificationUrl);

    const sendSmtpEmail = {
      to: [{ email: to }],
      sender: { email: process.env.BREVO_FROM_EMAIL },
      subject,
      htmlContent: emailTemplate,
    };

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error: any) {
      throw error;
    }
  }
}

export default EmailService;
