import { SubscriptionState } from "./SubscriptionState";

export class ActiveSubscriptionState implements SubscriptionState {
  async handle(
    userId: number,
    userData: any,
    prisma: any,
    emailClient: any
  ): Promise<void> {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 30);

    await prisma.subscription.update({
      where: { userId },
      data: {
        isActive: true,
        status: "Active",
        startDate: now,
        endDate,
      },
    });

    await emailClient.sendSubscriptionUpdate(
      userData.email,
      userData.name,
      "Success"
    );

    console.log(`Subscription activated for user ${userId}`);
  }
}
