import { Request, Response } from "express";
import EmailService from "../services/emailService";
import { EmailRequestDTO } from "../dtos/emailRequestDTO";

export const sendVerificationEmail = async (req: Request, res: Response) => {
  const { to, subject, templateType, placeholders }: EmailRequestDTO = req.body;

  if (!to || !subject || !templateType || !placeholders) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (placeholders.url) {
    try {
      new URL(placeholders.url);
    } catch {
      return res
        .status(400)
        .json({ error: "Invalid URL provided in placeholders" });
    }
  }

  try {
    await EmailService.sendEmail(to, subject, templateType, placeholders);
    return res
      .status(200)
      .json({ message: `${templateType} email sent successfully` });
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.message || "Failed to send email.";
    return res.status(statusCode).json({ error: errorMessage });
  }
};
