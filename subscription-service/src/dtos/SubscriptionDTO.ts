// Represents the subscription status returned to the client
export interface SubscriptionStatusDTO {
  isActive: boolean; // Whether the subscription is active
  plan: "None" | "Basic"; // Plan type (e.g., Basic, None)
  startDate?: Date | null; // Subscription start date (optional)
  endDate?: Date | null; // Subscription end date (optional)
}

// DTO for updating a subscription
export interface UpdateSubscriptionDTO {
  isActive: boolean; // Whether to activate or deactivate the subscription
  plan: "None" | "Basic"; // Desired subscription plan
  paymentMethod: string; // Optional, only needed for activation/upgrades
}

// Represents a complete subscription object from the database
export interface SubscriptionDTO {
  id: number; // Unique ID of the subscription
  userId: number; // Associated user ID
  isActive: boolean; // Whether the subscription is active
  plan: "None" | "Basic"; // Subscription plan type
  startDate?: Date | null; // Start date of the subscription (optional)
  endDate?: Date | null; // End date of the subscription (optional)
}
