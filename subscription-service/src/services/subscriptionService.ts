import prisma from "../clients/prisma";
import { AppError } from "../middleware/errorHandler";
import paymentServiceClient from "../clients/paymentServiceClient";
import {
  UpdateSubscriptionDTO,
  SubscriptionStatusDTO,
} from "../dtos/SubscriptionDTO";

import { SubscriptionContext } from "./state/SubscriptionContext";
import { ActiveSubscriptionState } from "./state/ActiveSubscriptionState";
import { FailedSubscriptionState } from "./state/FailedSubscriptionState";
import EmailServiceClient from "../clients/EmailServiceClient";
import axios from "axios";

class SubscriptionService {
  async getSubscriptionStatus(userId: number): Promise<SubscriptionStatusDTO> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return { isActive: false, plan: "None", startDate: null, endDate: null };
    }

    const now = new Date();

    if (subscription.endDate && subscription.endDate <= now) {
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
    updateDTO: UpdateSubscriptionDTO,
    cookies: string
  ): Promise<{ status: string; paymentData?: any }> {
    const { isActive, plan, paymentMethod } = updateDTO;
    const subscriptionAmount = 20;
    const type = "Subscription";
    const transactionType = "Payment";

    if (!["None", "Basic"].includes(plan)) {
      throw new AppError("Invalid subscription plan.", 400);
    }

    if (isActive && plan === "Basic") {
      if (!paymentMethod) {
        throw new AppError(
          "A valid payment method is required to activate the subscription.",
          400
        );
      }

      const paymentData = await this.processPayment(
        userId,
        plan,
        paymentMethod,
        subscriptionAmount,
        cookies,
        type,
        transactionType
      );

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          isActive: false,
          plan,
          status: "Pending",
          startDate: null,
          endDate: null,
          paymentMethod,
        },
        update: {
          isActive: false,
          plan,
          status: "Pending",
          startDate: null,
          endDate: null,
          paymentMethod,
        },
      });

      return { status: "pending", paymentData };
    }

    if (!isActive) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          isActive: false,
          plan: "None",
          status: "Cancelled",
          startDate: null,
          endDate: null,
          paymentMethod: null,
        },
      });

      return { status: "cancelled" };
    }

    throw new AppError("Invalid subscription update request.", 400);
  }

  private async processPayment(
    userId: number,
    plan: string,
    paymentMethod: string,
    amount: number,
    cookies: string,
    type: string,
    transactionType: string
  ): Promise<any> {
    try {
      console.log(
        `Processing payment for userId: ${userId}, plan: ${plan}, amount: €${amount}`
      );

      const paymentResponse = await paymentServiceClient.processPayment(
        userId,
        plan,
        paymentMethod,
        amount,
        cookies,
        type,
        transactionType
      );

      return paymentResponse;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error processing payment:", error.message);
      } else {
        console.error("An unexpected error occurred.");
      }
      throw new AppError("Payment processing failed.", 500);
    }
  }

  async handleSubscriptionWebhook(
    userId: number,
    status: string,
    cookies: string
  ) {
    try {
      const userResponse = await axios.get(
        `${process.env.USER_URL}/api/users/profile`,
        {
          withCredentials: true,
          headers: {
            cookie: cookies,
          },
        }
      );

      const userData = userResponse.data.data;

      const subscriptionContext = new SubscriptionContext();

      if (status === "Success") {
        subscriptionContext.setState(new ActiveSubscriptionState());
      } else if (status === "Failed") {
        subscriptionContext.setState(new FailedSubscriptionState());
      } else {
        throw new Error(`Unhandled subscription status: ${status}`);
      }
      await subscriptionContext.handle(
        userId,
        userData,
        prisma,
        EmailServiceClient
      );
      console.log(`Subscription update failed for user ${userId}`);
    } catch (error) {
      console.error("Error updating subscription from webhook:", error);
      throw new AppError("Failed to update subscription from webhook.", 500);
    }
  }
}

export default new SubscriptionService();
