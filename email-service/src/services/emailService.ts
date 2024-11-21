// src/clients/EmailService.ts
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

  private validateEmailParameters(to: string, subject: string) {
    if (!to) {
      throw new Error("Error: Recipient email address is required.");
    }

    if (!subject) {
      throw new Error("Error: Email subject is required.");
    }
  }

  private generateTemplate(
    templateType: string,
    placeholders: Record<string, string>
  ): string {
    const templates: Record<string, string> = {
      verification: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; font-size: 24px; color: #4CAF50; font-weight: bold; }
            .content { margin: 20px 0; font-size: 16px; color: #333; line-height: 1.6; }
            .cta { text-align: center; margin: 30px 0; }
            .button { background: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Verify Your Email</div>
            <div class="content">
              <p>Hi ${placeholders.name},</p>
              <p>Thank you for signing up! To get started, please verify your email by clicking the button below:</p>
            </div>
            <div class="cta">
              <a href="${placeholders.url}" class="button">Verify Email</a>
            </div>
            <div class="content">
              <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
              <p><a href="${placeholders.url}">${placeholders.url}</a></p>
            </div>
            <div class="footer">© 2024 Your Company. All rights reserved.</div>
          </div>
        </body>
        </html>
      `,
      passwordReset: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; font-size: 24px; color: #FF5722; font-weight: bold; }
            .content { margin: 20px 0; font-size: 16px; color: #333; line-height: 1.6; }
            .cta { text-align: center; margin: 30px 0; }
            .button { background: #FF5722; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Reset Your Password</div>
            <div class="content">
              <p>Hi ${placeholders.name},</p>
              <p>You requested to reset your password. Please click the button below to reset it:</p>
            </div>
            <div class="cta">
              <a href="${placeholders.url}" class="button">Reset Password</a>
            </div>
            <div class="content">
              <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
              <p><a href="${placeholders.url}">${placeholders.url}</a></p>
              <p>This link will expire in 1 hour for security reasons.</p>
            </div>
            <div class="footer">© 2024 Your Company. All rights reserved.</div>
          </div>
        </body>
        </html>
      `,
      accountDeletion: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; font-size: 24px; color: #E53935; font-weight: bold; }
            .content { margin: 20px 0; font-size: 16px; color: #333; line-height: 1.6; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Account Deleted</div>
            <div class="content">
              <p>Hi ${placeholders.name},</p>
              <p>Your account has been successfully deleted. We're sad to see you go.</p>
              <p>If this was a mistake, please contact our support team.</p>
            </div>
            <div class="footer">© 2024 Your Company. All rights reserved.</div>
          </div>
        </body>
        </html>
      `,
      accountDeactivation: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; font-size: 24px; color: #FF9800; font-weight: bold; }
            .content { margin: 20px 0; font-size: 16px; color: #333; line-height: 1.6; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Account Deactivated</div>
            <div class="content">
              <p>Hi ${placeholders.name},</p>
              <p>Your account has been deactivated. If you believe this is a mistake, please contact support.</p>
            </div>
            <div class="footer">© 2024 Your Company. All rights reserved.</div>
          </div>
        </body>
        </html>
      `,
      roleUpdate: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; font-size: 24px; color: #2196F3; font-weight: bold; }
            .content { margin: 20px 0; font-size: 16px; color: #333; line-height: 1.6; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Role Updated</div>
            <div class="content">
              <p>Hi ${placeholders.name},</p>
              <p>Your role has been updated to <strong>${placeholders.role}</strong>.</p>
              <p>If you have questions, please contact our support team.</p>
            </div>
            <div class="footer">© 2024 Your Company. All rights reserved.</div>
          </div>
        </body>
        </html>
      `,
    };

    const template = templates[templateType];
    if (!template) {
      throw new Error(`Template type '${templateType}' is not supported.`);
    }

    return Object.keys(placeholders).reduce(
      (updatedTemplate, key) =>
        updatedTemplate.replace(
          new RegExp(`\\$\\{${key}\\}`, "g"),
          placeholders[key]
        ),
      template
    );
  }

  async sendEmail(
    to: string,
    subject: string,
    templateType: string,
    placeholders: Record<string, string>
  ) {
    this.validateEmailParameters(to, subject);

    const emailTemplate = this.generateTemplate(templateType, placeholders);

    const sendSmtpEmail = {
      to: [{ email: to }],
      sender: { email: process.env.BREVO_FROM_EMAIL },
      subject,
      htmlContent: emailTemplate,
    };

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log("Email sent successfully:", response.data);
    } catch (error: any) {
      console.error("Error sending email:", error.message);
      throw error;
    }
  }
}

export default new EmailService();
