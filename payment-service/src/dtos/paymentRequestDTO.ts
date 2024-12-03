export interface PaymentRequestDTO {
  method: "Stripe" | "PayPal";
  amount: number;
  userId: number;
}
