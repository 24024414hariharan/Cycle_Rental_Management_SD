// src/services/strategies/paymentStrategy.ts
export interface PaymentStrategy {
  processPayment(amount: number, userId: number, cookies: string): Promise<any>;
  processRefund(transactionId: string, amount?: number): Promise<any>;
}
