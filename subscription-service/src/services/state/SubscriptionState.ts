export interface SubscriptionState {
  handle(
    userId: number,
    userData: any,
    prisma: any,
    emailClient: any
  ): Promise<void>;
}
