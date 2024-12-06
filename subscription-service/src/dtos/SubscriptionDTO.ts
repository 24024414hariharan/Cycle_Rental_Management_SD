export interface SubscriptionStatusDTO {
  isActive: boolean;
  plan: "None" | "Basic";
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface UpdateSubscriptionDTO {
  isActive: boolean;
  plan: "None" | "Basic";
  paymentMethod: string;
}

export interface SubscriptionDTO {
  id: number;
  userId: number;
  isActive: boolean;
  plan: "None" | "Basic";
  startDate?: Date | null;
  endDate?: Date | null;
}
