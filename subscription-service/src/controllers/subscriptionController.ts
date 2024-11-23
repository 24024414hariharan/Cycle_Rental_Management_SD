import { Request, Response } from "express";
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

    const subscription = await subscriptionService.updateSubscription(userId, {
      isActive,
      plan,
      paymentMethod,
    });

    res.status(200).json({
      status: "success",
      message: "Subscription updated successfully.",
      data: subscription,
    });
  }
);
