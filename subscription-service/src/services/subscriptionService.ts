import prisma from "../clients/prisma";
import { AppError } from "../middleware/errorHandler";
import {
  UpdateSubscriptionDTO,
  SubscriptionStatusDTO,
} from "../dtos/SubscriptionDTO";

class SubscriptionService {
  async getSubscriptionStatus(userId: number): Promise<SubscriptionStatusDTO> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return { isActive: false, plan: "None", startDate: null, endDate: null };
    }

    const now = new Date();

    // Check if the subscription has expired
    if (subscription.endDate && subscription.endDate <= now) {
      // Deactivate the subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          isActive: false,
          plan: "None",
          startDate: null,
          endDate: null,
        },
      });

      return { isActive: false, plan: "None", startDate: null, endDate: null };
    }

    return {
      isActive: subscription.isActive,
      plan: subscription.plan as "None" | "Basic",
      startDate: subscription.startDate,
      endDate: subscription.endDate,
    };
  }

  async updateSubscription(
    userId: number,
    updateDTO: UpdateSubscriptionDTO
  ): Promise<SubscriptionStatusDTO> {
    const { isActive, plan, paymentMethod } = updateDTO;

    if (!["None", "Basic"].includes(plan)) {
      throw new AppError("Invalid subscription plan.", 400);
    }

    if (isActive && plan === "Basic") {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + 30); // Add 30 days for Basic Plan

      const subscription = await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          isActive: true,
          plan,
          startDate: now,
          endDate,
        },
        update: {
          isActive: true,
          plan,
          startDate: now,
          endDate,
        },
      });

      return {
        isActive: subscription.isActive,
        plan: subscription.plan as "None" | "Basic",
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      };
    }

    if (!isActive) {
      const subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          isActive: false,
          plan: "None",
          startDate: null,
          endDate: null,
        },
      });

      return {
        isActive: subscription.isActive,
        plan: subscription.plan as "None" | "Basic",
        startDate: null,
        endDate: null,
      };
    }

    throw new AppError("Invalid subscription update request.", 400);
  }
}

export default new SubscriptionService();
