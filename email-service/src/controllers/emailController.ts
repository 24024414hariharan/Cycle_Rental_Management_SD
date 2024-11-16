import { Request, Response } from "express";
import EmailService from "../services/emailService";

export const sendVerificationEmail = async (req: Request, res: Response) => {
  const { to, subject, verificationUrl } = req.body;

  if (!to || !subject || !verificationUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    new URL(verificationUrl);
  } catch {
    return res.status(400).json({ error: "Invalid verification URL" });
  }

  try {
    await new EmailService().sendCustomEmail(to, subject, verificationUrl);
    return res
      .status(200)
      .json({ message: "Verification email sent successfully" });
  } catch (error: any) {
    if (error.response) {
      return res.status(502).json({
        error: "Failed to send email: " + (error.response?.data || "Unknown error"),
      });
    }
    return res.status(500).json({ error: "Error sending verification email" });
  }
};
