import { Request, Response, NextFunction } from "express";
import subscriptionService from "../services/subscriptionService";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";

export const getSubscriptionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized: User information missing.", 401);
    }

    const subscription = await subscriptionService.getSubscriptionStatus(
      userId
    );

    res.status(200).json({
      status: "success",
      message: "Subscription status retrieved successfully.",
      data: subscription,
    });
  }
);

export const updateSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Unauthorized: User information missing.", 401);
    }

    const { isActive, plan, paymentMethod } = req.body;
    const cookies = req.headers.cookie || "";

    const subscription = await subscriptionService.updateSubscription(
      userId,
      {
        isActive,
        plan,
        paymentMethod,
      },
      cookies
    );

    res.status(200).json({
      status: "success",
      message: "Subscription updated successfully.",
      data: subscription,
    });
  }
);

export const handleSubscriptionWebhook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, status } = req.body;
    const cookies = req.headers.cookie || "";

    if (!userId || !status) {
      throw new AppError(
        "Invalid webhook payload: userId or status missing.",
        400
      );
    }

    try {
      await subscriptionService.handleSubscriptionWebhook(
        userId,
        status,
        cookies
      );
      res.status(200).json({
        status: "success",
        message: "Subscription status updated from webhook.",
      });
    } catch (error) {
      next(error);
    }
  }
);
