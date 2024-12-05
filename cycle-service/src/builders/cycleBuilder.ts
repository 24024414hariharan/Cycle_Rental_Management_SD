// src/builders/cycleBuilder.ts
import { CycleDTO } from "../dtos/cycldataDTO";

export class CycleBuilder implements CycleDTO {
  modelId!: number;
  condition!: string;
  status!: string;
  location?: string;
  hourlyRate?: number;
  deposit?: number;

  setModelId(modelId: number): this {
    if (!modelId) throw new Error("Model ID is required.");
    this.modelId = modelId;
    return this;
  }

  setCondition(condition: string): this {
    if (!condition) throw new Error("Condition is required.");
    this.condition = condition;
    return this;
  }

  setStatus(status: string): this {
    if (!status) throw new Error("Status is required.");
    this.status = status;
    return this;
  }

  setLocation(location?: string): this {
    this.location = location;
    return this;
  }

  setHourlyRate(hourlyRate?: number): this {
    if (hourlyRate !== undefined && hourlyRate <= 0) {
      throw new Error("Hourly rate must be positive.");
    }
    this.hourlyRate = hourlyRate;
    return this;
  }

  setDeposit(deposit?: number): this {
    if (deposit !== undefined && deposit < 0) {
      throw new Error("Deposit cannot be negative.");
    }
    this.deposit = deposit;
    return this;
  }

  build(): CycleDTO {
    if (!this.modelId || !this.condition || !this.status) {
      throw new Error("All required fields must be provided.");
    }
    return {
      modelId: this.modelId,
      condition: this.condition,
      status: this.status,
      location: this.location,
      hourlyRate: this.hourlyRate,
      deposit: this.deposit,
    };
  }
}
