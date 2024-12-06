import { Request, Response } from "express";
import { StripePayment } from "../services/strategies/stripePayment";
import { PayPalPayment } from "../services/strategies/paypalPayment";
import PaymentService from "../services/paymentService";
import { AppError } from "../middleware/errorHandler";
import prisma from "../clients/prisma";

const paypalPayment = new PayPalPayment();

export const createPayment = async (req: Request, res: Response) => {
  const { paymentMethod, amount, type, transactionType, transactionID } =
    req.body;
  const rentalID = req.body.rentalID || null;
  const userId = req.user?.userId;
  const cookies = req.headers.cookie || "";
  console.log(transactionID);
  if (!userId) {
    throw new AppError("Unauthorized: User ID is missing.", 401);
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new AppError("Invalid amount: Must be a positive number.", 400);
  }

  const strategy =
    paymentMethod === "Stripe" ? new StripePayment() : new PayPalPayment();
  const paymentService = new PaymentService(strategy);

  if (transactionType === "Payment") {
    const paymentResponse = await paymentService.processPayment(
      userId,
      amount,
      cookies,
      type,
      rentalID
    );

    res.json({
      status: "pending",
      data: {
        clientSecret: paymentResponse.client_secret || null,
        approvalUrl: paymentResponse.approvalUrl || null,
      },
    });
  } else if (transactionType === "Refund") {
    const paymentResponse = await paymentService.processRefund(
      transactionID,
      amount,
      userId,
      cookies,
      type,
      rentalID
    );
    res.json({
      status: "success",
      data: {
        message: "Refund processed successfully.",
        refundDetails: paymentResponse,
      },
    });
  } else {
    throw new AppError(
      "Invalid transaction type. Use 'payment' or 'refund'.",
      400
    );
  }
};

export const paypalCapture = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({
      status: "error",
      message: "Order ID (token) is required to capture payment.",
    });
  }

  console.log("Order ID (token):", token);

  try {
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

export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const rentalID = parseInt(req.query.rentalID as string, 10);

    const paymentDetails = await prisma.payment.findUnique({
      where: {
        rentalID,
      },
    });

    if (!paymentDetails) {
      throw new Error("Payment details not found for the given rental ID.");
    }

    res.json({
      status: "success",
      message: "Payment details fetched successfully.",
      data: paymentDetails,
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
