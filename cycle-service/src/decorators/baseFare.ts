export interface IFare {
  calculate(): number;
}

export class BaseFare implements IFare {
  private hourlyRate: number;
  private rentalHours: number;
  private deposit: number;

  constructor(hourlyRate: number, rentalHours: number, deposit: number) {
    this.hourlyRate = hourlyRate;
    this.rentalHours = rentalHours;
    this.deposit = deposit;
  }

  calculate(): number {
    return this.hourlyRate * this.rentalHours + this.deposit;
  }
}
