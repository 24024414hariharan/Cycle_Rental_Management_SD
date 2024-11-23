import prisma from "../clients/prisma";
import { AppError } from "../middleware/errorHandler";

class SubscriptionService {
  async getSubscriptionStatus(userId: number): Promise<any> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return { isActive: false, plan: "None" }; 
    }

    return {
      isActive: subscription.isActive,
      plan: subscription.plan,
    };
  }

  async updateSubscription(
    userId: number,
    isActive: boolean,
    plan: string = "None"
  ): Promise<any> {
    if (!["None", "Basic"].includes(plan)) {
      throw new AppError("Invalid subscription plan.", 400);
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: { userId, isActive, plan },
      update: { isActive, plan },
    });

    return subscription;
  }
}

export default new SubscriptionService();
