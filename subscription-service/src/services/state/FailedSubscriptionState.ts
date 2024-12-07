import { SubscriptionState } from "./SubscriptionState";

export class FailedSubscriptionState implements SubscriptionState {
  async handle(
    userId: number,
    userData: any,
    prisma: any,
    emailClient: any
  ): Promise<void> {
    await prisma.subscription.update({
      where: { userId },
      data: {
        isActive: false,
        status: "Failed",
      },
    });

    await emailClient.sendSubscriptionUpdate(
      userData.email,
      userData.name,
      "Failed"
    );

    console.log(`Subscription update failed for user ${userId}`);
  }
}
