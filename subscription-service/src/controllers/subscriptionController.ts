import { Request, Response } from "express";
import subscriptionService from "../services/subscriptionService";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";

export const getSubscriptionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized: User information missing.", 401);
    }

    const userId = Number(req.user.userId);
    if (!userId || isNaN(userId)) {
      throw new AppError("Invalid user ID.", 400);
    }

    console.log("Retrieving subscription for user ID:", userId);

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
    if (!req.user?.userId) {
      throw new AppError("Unauthorized: User information missing.", 401);
    }

    const userId = Number(req.user.userId);
    if (!userId || isNaN(userId)) {
      throw new AppError("Invalid user ID.", 400);
    }

    const { isActive, plan } = req.body;

    // Validate `isActive` as a boolean
    if (typeof isActive !== "boolean") {
      throw new AppError(
        "Invalid subscription status: Must be a boolean.",
        400
      );
    }

    // Validate `plan` against a list of allowed values
    const validPlans = ["None", "Basic", "Premium"];
    if (!validPlans.includes(plan)) {
      throw new AppError(
        `Invalid subscription plan. Allowed plans: ${validPlans.join(", ")}`,
        400
      );
    }

    console.log("Updating subscription for user ID:", userId);
    console.log("Request Body:", { isActive, plan });

    const subscription = await subscriptionService.updateSubscription(
      userId,
      isActive,
      plan
    );

    res.status(200).json({
      status: "success",
      message: "Subscription updated successfully.",
      data: subscription,
    });
  }
);
