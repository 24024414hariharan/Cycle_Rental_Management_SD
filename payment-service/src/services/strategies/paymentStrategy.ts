export interface PaymentStrategy {
  processPayment(
    amount: number,
    userId: number,
    cookies: string,
    type: string,
    rentalID: number
  ): Promise<any>;
  processRefund(
    transactionId: string,
    amount: number,
    userId: number,
    cookies: string,
    type: string,
    rentalID: number
  ): Promise<any>;
}
