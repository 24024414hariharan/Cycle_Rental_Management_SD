export interface CycleDTO {
  modelId: number;
  condition: string;
  status: string;
  location?: string;
  hourlyRate?: number;
  deposit?: number;
}

export interface CycleModelDTO {
  type: string;
  brand: string;
  hourlyRate: number;
  deposit?: number;
}

export interface CycleRentalDTO {
  id: number;
  startTime: Date;
  duration: number;
  expectedReturnTime: Date;
  actualReturnTime?: Date;
  totalFare: number;
  userId: number;
  cycleId: number;
}

export interface PaymentRequestDTO {
  userId: number;
  paymentMethod: string;
  amount: number;
  cookies: string;
  type: string;
  rentalId: number;
  transactionType: string;
  transactionID?: string;
}
