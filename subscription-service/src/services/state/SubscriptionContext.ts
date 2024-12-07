import { SubscriptionState } from "./SubscriptionState";

export class SubscriptionContext {
  private state?: SubscriptionState; // Optional state

  setState(state: SubscriptionState) {
    this.state = state;
  }

  async handle(userId: number, userData: any, prisma: any, emailClient: any) {
    if (!this.state) {
      throw new Error("Subscription state is not set.");
    }
    await this.state.handle(userId, userData, prisma, emailClient);
  }
}
