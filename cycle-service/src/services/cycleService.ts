import { BaseFare, IFare } from "../decorators/baseFare";
import { DiscountPlanDecorator } from "../decorators/discountPlanDecorator";
import axios from "axios";
import prisma from "../clients/prisma";
import { CycleDTO, CycleModelDTO, CycleRentalDTO } from "../dtos/cycldataDTO";
import { AppError } from "../middleware/errorHandler";
import EmailServiceClient from "../clients/EmailServiceClient";

class CycleService {
  async calculateFare(
    cycleId: number,
    rentalHours: number,
    cookies: string,
    userId: number
  ): Promise<any> {
    // Fetch the cycle and its model details
    const cycle = await prisma.cycle.findUnique({
      where: { id: cycleId },
      include: { model: true }, // Include the related CycleModel
    });

    if (!cycle) {
      throw new Error("Cycle not found.");
    }

    const deposit = cycle.deposit ?? cycle.model.deposit;
    const hourlyRate = cycle.hourlyRate ?? cycle.model.hourlyRate;

    // Check subscription status
    const { data: subscription } = await axios.get(
      `${process.env.SUBSCRIPTION_SERVICE_URL}/subscription`,
      {
        headers: { cookie: cookies },
      }
    );

    const isSubscribed = subscription.data.isActive;

    // Use the Decorator Pattern for discount
    let fare: IFare = new BaseFare(hourlyRate, rentalHours, deposit);
    if (isSubscribed) {
      fare = new DiscountPlanDecorator(fare);
    }

    const totalFare = fare.calculate();

    // Save rental details to the database
    const rental = await prisma.cycleRental.create({
      data: {
        startTime: new Date(),
        duration: rentalHours,
        expectedReturnTime: new Date(Date.now() + rentalHours * 60 * 60 * 1000), // Calculate expected return time
        totalFare,
        userId, // Assuming subscription contains the userId
        cycleId: cycle.id,
      },
    });

    // Return the calculated fare and rental details
    return {
      rentalId: rental.id,
      cycleId: cycle.id,
      model: cycle.model.type,
      brand: cycle.model.brand,
      deposit,
      hourlyRate,
      rentalHours,
      totalFare,
    };
  }

  async addCycleModel(modelData: CycleModelDTO): Promise<any> {
    // Add a new cycle model to the database
    const newModel = await prisma.cycleModel.create({
      data: {
        type: modelData.type,
        brand: modelData.brand,
        hourlyRate: modelData.hourlyRate,
        deposit: modelData.deposit,
      },
    });

    return newModel;
  }

  async getAllCycleModels(): Promise<any> {
    // Fetch all available cycle models
    return await prisma.cycleModel.findMany();
  }

  async addCycle(cycleData: CycleDTO): Promise<any> {
    const newCycle = await prisma.cycle.create({
      data: {
        modelId: cycleData.modelId,
        condition: cycleData.condition,
        status: cycleData.status,
        location: cycleData.location,
        hourlyRate: cycleData.hourlyRate,
        deposit: cycleData.deposit,
      },
    });
    return newCycle;
  }

  async getAllCycles(filters: {
    type?: string;
    brand?: string;
    status?: string;
    location?: string;
  }): Promise<any> {
    return await prisma.cycle.findMany({
      where: {
        model: {
          type: filters.type,
          brand: filters.brand,
        },
        status: filters.status,
        location: filters.location,
      },
      include: {
        model: true, // Include CycleModel details
      },
    });
  }
  async getRentalDetailsById(rentalId: number): Promise<CycleRentalDTO | null> {
    const rental = await prisma.cycleRental.findUnique({
      where: { id: rentalId },
      include: {
        cycle: {
          include: {
            model: true, // Include CycleModel if needed
          },
        },
      },
    });

    if (!rental) {
      throw new Error(`Rental with ID ${rentalId} not found`);
    }

    return {
      id: rental.id,
      startTime: rental.startTime,
      duration: rental.duration,
      expectedReturnTime: rental.expectedReturnTime,
      actualReturnTime: rental.actualReturnTime || undefined,
      totalFare: rental.totalFare,
      userId: rental.userId,
      cycleId: rental.cycleId,
    };
  }

  async handleSubscriptionWebhook(
    userId: number,
    status: string,
    cookies: string,
    rentalID: number
  ) {
    try {
      const user = await axios.get(
        `${process.env.USER_URL}/api/users/profile`,
        {
          withCredentials: true,
          headers: {
            cookie: cookies,
          },
        }
      );
      if (status === "Success") {
        const cycleRentalRecord = await prisma.cycleRental.findUnique({
          where: { id: rentalID },
          select: { cycleId: true }, // Only retrieve the cycleId field
        });

        if (!cycleRentalRecord || !cycleRentalRecord.cycleId) {
          console.error(
            `Cycle rental record not found for rentalID: ${rentalID}`
          );
          throw new Error("Cycle rental record not found.");
        }

        const cycleId = cycleRentalRecord.cycleId;

        await prisma.cycleRental.update({
          where: { id: rentalID },
          data: {
            paymentStatus: "Success",
          },
        });

        // Update the availability status in the cycle table
        await prisma.cycle.update({
          where: { id: cycleId },
          data: {
            status: "Unavailable", // Mark the cycle as unavailable
          },
        });

        await EmailServiceClient.sendRentalUpdate(
          user.data.data.email,
          user.data.data.name,
          status
        );
      } else if (status === "Failed") {
        await prisma.cycleRental.update({
          where: { id: rentalID },
          data: {
            paymentStatus: "Failed",
          },
        });

        await EmailServiceClient.sendRentalUpdate(
          user.data.data.email,
          user.data.data.name,
          status
        );

        console.log(`Cycle update failed for user ${userId}`);
      }
    } catch (error) {
      console.error("Error updating Cycle from webhook:", error);
      throw new AppError("Failed to update Cycle from webhook.", 500);
    }
  }
}

export default new CycleService();
