// src/dtos/CycleDTO.ts
export interface CycleDTO {
  modelId: number;
  condition: string;
  status: string;
  location?: string;
  hourlyRate?: number; // Optional to override model rate
  deposit?: number; // Optional to override model deposit
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
