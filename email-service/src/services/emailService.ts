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

    return `<!DOCTYPE html> ... `;
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
      console.log("Attempting to send email:", sendSmtpEmail);
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log("Email sent successfully:", response);
    } catch (error: any) {
      console.error(
        "Error sending email:",
        error.response?.body || error.message
      );
      throw error;
    }
  }
}

export default EmailService;
