import { BaseFare, IFare } from "../decorators/baseFare";
import { DiscountPlanDecorator } from "../decorators/discountPlanDecorator";
import axios from "axios";

class CycleService {
  async calculateFare(cycleId: number, rentalHours: number, token: string): Promise<any> {
    
    const cycle = { model: "Basic", hourlyRate: 2, deposit: 15 }; 

    
    const { data: subscription } = await axios.get(`${process.env.SUBSCRIPTION_SERVICE_URL}/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const isSubscribed = subscription.isActive;

    
    let fare: IFare = new BaseFare(cycle.hourlyRate, rentalHours, cycle.deposit);

    
    if (isSubscribed) {
      fare = new DiscountPlanDecorator(fare);
    }

    return {
      rentalHours,
      hourlyRate: cycle.hourlyRate,
      deposit: cycle.deposit,
      totalFare: fare.calculate(),
    };
  }
}

export default new CycleService();
