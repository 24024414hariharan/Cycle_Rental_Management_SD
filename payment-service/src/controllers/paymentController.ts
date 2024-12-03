import { Request, Response } from "express";
import { StripePayment } from "../services/strategies/stripePayment";
import { PayPalPayment } from "../services/strategies/paypalPayment";
import PaymentService from "../services/paymentService";
import { AppError } from "../middleware/errorHandler";

const paypalPayment = new PayPalPayment();

export const createPayment = async (req: Request, res: Response) => {
  const { paymentMethod, amount } = req.body;
  const userId = req.user?.userId;
  const cookies = req.headers.cookie || "";
  if (!userId) {
    throw new AppError("Unauthorized: User ID is missing.", 401);
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new AppError("Invalid amount: Must be a positive number.", 400);
  }

  const strategy =
    paymentMethod === "Stripe" ? new StripePayment() : new PayPalPayment();
  const paymentService = new PaymentService(strategy);

  // Initiate payment
  const paymentResponse = await paymentService.processPayment(
    userId,
    amount,
    cookies
  );

  res.json({
    status: "pending",
    data: {
      clientSecret: paymentResponse.client_secret || null, // For Stripe
      approvalUrl: paymentResponse.approvalUrl || null, // For PayPal
    },
  });
};

export const paypalCapture = async (req: Request, res: Response) => {
  const { token } = req.query; // Extract `token` from the query string

  // Ensure the token (orderId) exists
  if (!token || typeof token !== "string") {
    return res.status(400).json({
      status: "error",
      message: "Order ID (token) is required to capture payment.",
    });
  }

  console.log("Order ID (token):", token);

  try {
    // Pass the token (orderId) to the capturePayment method
    const captureResponse = await paypalPayment.capturePayment(token);
    res.json({
      status: "success",
      message: "Payment captured successfully.",
      data: captureResponse,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "An unknown error occurred.",
      });
    }
  }
};
