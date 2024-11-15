import axios from "axios";
import axiosRetry from "axios-retry";
import { AppError } from "../middleware/errorHandler";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

class EmailServiceClient {
  private emailServiceUrl: string;

  constructor() {
    this.emailServiceUrl =
      process.env.EMAIL_SERVICE_URL ||
      "http://localhost:4000/api/email/send-verification";
  }

  async sendVerificationEmail(to: string, verificationUrl: string) {
    try {
      await axios.post(this.emailServiceUrl, {
        to,
        subject: "Email Verification",
        verificationUrl,
      });
    } catch (error: any) {
      // Construct a meaningful error message
      console.log(error);
      const errorMessage = error.response
        ? `Email service responded with status ${error.response.status}: ${
            error.response.data.message || error.response.statusText
          }`
        : "Email service is unreachable. Please try again later.";

      // Re-throw the error as an operational error using the custom AppError class
      throw new AppError(errorMessage, error.response?.status || 500);
    }
  }
}

export default new EmailServiceClient();
