import { IFare } from "./baseFare";

export class DiscountPlanDecorator implements IFare {
  private fare: IFare;

  constructor(fare: IFare) {
    this.fare = fare;
  }

  calculate(): number {
    const baseCost = this.fare.calculate();
    const discount = baseCost * 0.05;
    return baseCost - discount;
  }
}