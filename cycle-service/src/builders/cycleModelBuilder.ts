import { CycleModelDTO } from "../dtos/cycldataDTO";

export class CycleModelBuilder implements CycleModelDTO {
  type!: string;
  brand!: string;
  hourlyRate!: number;
  deposit?: number;

  setType(type: string): this {
    if (!type) throw new Error("Type is required.");
    this.type = type;
    return this;
  }

  setBrand(brand: string): this {
    if (!brand) throw new Error("Brand is required.");
    this.brand = brand;
    return this;
  }

  setHourlyRate(hourlyRate: number): this {
    if (hourlyRate <= 0) throw new Error("Hourly rate must be positive.");
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

  build(): CycleModelDTO {
    if (!this.type || !this.brand || !this.hourlyRate) {
      throw new Error("All required fields must be provided.");
    }
    return {
      type: this.type,
      brand: this.brand,
      hourlyRate: this.hourlyRate,
      deposit: this.deposit || 15.0,
    };
  }
}
