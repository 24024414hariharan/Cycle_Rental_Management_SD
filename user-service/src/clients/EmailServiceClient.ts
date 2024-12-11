import axios from "axios";
import axiosRetry from "axios-retry";
import { AppError } from "../middleware/errorHandler";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

class EmailServiceClient {
  private readonly emailServiceUrl: string;

  constructor() {
    this.emailServiceUrl =
      process.env.EMAIL_SERVICE_URL ??
      "http://localhost:4000/api/email/send-verification";
  }

  async sendEmail(
    to: string,
    subject: string,
    templateType: string,
    placeholders: Record<string, string>
  ) {
    try {
      await axios.post(this.emailServiceUrl, {
        to,
        subject,
        templateType,
        placeholders,
      });
      console.log(
        `Email sent successfully to ${to} with template ${templateType}`
      );
    } catch (error: any) {
      const errorMessage = error.response
        ? `Email service responded with status ${error.response.status}: ${
            error.response.data.message || error.response.statusText
          }`
        : "Email service is unreachable. Please try again later.";

      throw new AppError(errorMessage, error.response?.status || 500);
    }
  }

  async sendVerificationEmail(
    to: string,
    verificationUrl: string,
    name: string
  ) {
    await this.sendEmail(to, "Verify Your Email", "verification", {
      url: verificationUrl,
      name: name,
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, name: string) {
    await this.sendEmail(to, "Reset Your Password", "passwordReset", {
      url: resetUrl,
      name: name,
    });
  }

  async sendAccountDeletionEmail(to: string, name: string) {
    await this.sendEmail(to, "Account Deleted", "accountDeletion", {
      name: name,
    });
  }

  async sendAccountDeactivationEmail(to: string, name: string) {
    await this.sendEmail(to, "Account Deactivated", "accountDeactivation", {
      name: name,
    });
  }

  async sendRoleUpdateEmail(to: string, name: string, role: string) {
    await this.sendEmail(to, "Role Updated", "roleUpdate", { name, role });
  }
}

export default new EmailServiceClient();
