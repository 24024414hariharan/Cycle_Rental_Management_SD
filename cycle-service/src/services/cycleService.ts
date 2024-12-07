import { BaseFare, IFare } from "../decorators/baseFare";
import { DiscountPlanDecorator } from "../decorators/discountPlanDecorator";
import axios from "axios";
import prisma from "../clients/prisma";
import {
  CycleDTO,
  CycleModelDTO,
  CycleRentalDTO,
  PaymentRequestDTO,
} from "../dtos/cycldataDTO";
import { AppError } from "../middleware/errorHandler";
import EmailServiceClient from "../clients/EmailServiceClient";
import PaymentServiceClient from "../clients/paymentServiceClient";

import dotenv from "dotenv";
dotenv.config();

class CycleService {
  async calculateFare(
    cycleId: number,
    rentalHours: number,
    cookies: string,
    userId: number
  ): Promise<any> {
    const cycle = await prisma.cycle.findUnique({
      where: { id: cycleId },
      include: { model: true },
    });

    if (!cycle) {
      throw new Error("Cycle not found.");
    }

    const deposit = cycle.deposit ?? cycle.model.deposit;
    const hourlyRate = cycle.hourlyRate ?? cycle.model.hourlyRate;

    const { data: subscription } = await axios.get(
      `${process.env.SUBSCRIPTION_SERVICE_URL}/subscription`,
      {
        headers: { cookie: cookies },
      }
    );

    const isSubscribed = subscription.data.isActive;

    if (hourlyRate === null || deposit === null) {
      throw new Error("Hourly rate and deposit cannot be null.");
    }

    let fare: IFare = new BaseFare(hourlyRate, rentalHours, deposit);
    if (isSubscribed) {
      fare = new DiscountPlanDecorator(fare);
    }

    const totalFare = fare.calculate();

    const rental = await prisma.cycleRental.create({
      data: {
        startTime: new Date(),
        duration: rentalHours,
        expectedReturnTime: new Date(Date.now() + rentalHours * 60 * 60 * 1000),
        totalFare,
        userId,
        cycleId: cycle.id,
        balanceDue: 0,
        damageStatus: "None",
      },
    });

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
        model: true,
      },
    });
  }
  async getRentalDetailsById(rentalId: number): Promise<CycleRentalDTO | null> {
    const rental = await prisma.cycleRental.findUnique({
      where: { id: rentalId },
      include: {
        cycle: {
          include: {
            model: true,
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

  async handleCycleWebhook(
    userId: number,
    status: string,
    cookies: string,
    rentalID: number,
    type: string
  ) {
    try {
      console.log(`Webhook received for type: ${type}, status: ${status}`);

      const user = await axios.get(
        `${process.env.USER_URL}/api/users/profile`,
        {
          withCredentials: true,
          headers: {
            cookie: cookies,
          },
        }
      );

      switch (status) {
        case "Success":
          await this.handleSuccess(user, type, rentalID, status);
          break;

        case "Failed":
          await this.handleFailure(user, type, rentalID, status);
          break;

        default:
          throw new AppError("Invalid webhook status received.", 400);
      }
    } catch (error) {
      console.error("Error updating Cycle from webhook:", error);
      throw new AppError("Failed to update Cycle from webhook.", 500);
    }
  }

  private async handleSuccess(
    user: any,
    type: string,
    rentalID: number,
    status: string
  ) {
    if (type === "Cycle rental") {
      const cycleRentalRecord = await prisma.cycleRental.findUnique({
        where: { id: rentalID },
        select: { cycleId: true },
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

      await prisma.cycle.update({
        where: { id: cycleId },
        data: {
          status: "Unavailable",
        },
      });

      await EmailServiceClient.sendRentalUpdate(
        user.data.data.email,
        user.data.data.name,
        status
      );
      console.log(`Cycle rental success for rentalID: ${rentalID}`);
    } else if (type === "Deposit refund") {
      await prisma.cycleRental.update({
        where: { id: rentalID },
        data: {
          paymentStatus: "Settled",
        },
      });

      console.log(`Deposit refund settled for rentalID: ${rentalID}`);
    } else {
      console.warn(`Unhandled type for success: ${type}`);
    }
  }

  private async handleFailure(
    user: any,
    type: string,
    rentalID: number,
    status: string
  ) {
    if (type === "Cycle rental") {
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

      console.log(`Cycle rental failed for rentalID: ${rentalID}`);
    } else if (type === "Deposit refund") {
      await prisma.cycleRental.update({
        where: { id: rentalID },
        data: {
          paymentStatus: "Unsettled",
        },
      });

      console.log(`Deposit refund unsettled for rentalID: ${rentalID}`);
    } else {
      console.warn(`Unhandled type for failure: ${type}`);
    }
  }

  async processCycleReturn(
    rentalId: number,
    actualReturnTime: Date,
    userId: number,
    cookies: string
  ): Promise<{ message: string; data: any }> {
    const rental = await prisma.cycleRental.findUnique({
      where: { id: rentalId },
      include: {
        cycle: {
          include: {
            model: true,
          },
        },
      },
    });

    await prisma.cycle.update({
      where: { id: rental?.cycle.id },
      data: {
        status: "available",
      },
    });

    if (!rental) throw new AppError("Rental record not found.", 404);
    if (rental.userId !== userId)
      throw new AppError("Unauthorized action.", 403);

    const aiStatusCheck = await axios.post(
      `${process.env.AI_URL}/ai-check/status-check?rentalID=${rental.id}`,
      {
        withCredentials: true,
        cycleId: rental.id,
        headers: {
          cookie: cookies,
        },
      }
    );

    await prisma.cycleRental.update({
      where: { id: rentalId },
      data: { damageStatus: aiStatusCheck.data.status.toString() },
    });

    if (aiStatusCheck.data.status) {
      return this.handleGoodCycle(rental, actualReturnTime, userId, cookies);
    } else {
      return this.handleBadCycle(rental, actualReturnTime, userId, cookies);
    }
  }

  private async handleGoodCycle(
    rental: any,
    actualReturnTime: Date,
    userId: number,
    cookies: string
  ): Promise<{ message: string; data: any }> {
    const { expectedReturnTime, cycle } = rental;
    const deposit = cycle.deposit ?? cycle.model.deposit;
    const cycleHourRate = cycle.hourlyRate ?? cycle.model.hourlyRate;

    const extraHours = Math.max(
      0,
      (actualReturnTime.getTime() - expectedReturnTime.getTime()) /
        (1000 * 60 * 60)
    );

    const lateFees = extraHours * (cycleHourRate || 0);
    const cycleDeposit = deposit || 0;

    if (lateFees <= cycleDeposit) {
      const refundableDeposit = cycleDeposit - lateFees;

      await prisma.cycleRental.update({
        where: { id: rental.id },
        data: {
          actualReturnTime,
          totalFare: rental.totalFare + lateFees,
          balanceDue: 0.0,
        },
      });

      if (refundableDeposit > 0) {
        const paymentReference = await axios.get(
          `${process.env.PAYMENT_URL}/payments/get-payment-details?rentalID=${rental.id}`,
          {
            withCredentials: true,
            headers: {
              cookie: cookies,
            },
          }
        );

        const type = "Deposit refund";
        const transactionType = "Refund";

        const paymentRequest: PaymentRequestDTO = {
          userId,
          paymentMethod: paymentReference.data.data.method,
          amount: refundableDeposit,
          cookies,
          type,
          rentalId: rental.id,
          transactionType,
          transactionID: paymentReference.data.data.referenceId,
        };

        await PaymentServiceClient.processRefund(paymentRequest);
      }

      return {
        message: `Cycle returned successfully. ${
          refundableDeposit > 0
            ? "No Late fees and refund processed."
            : "No Late fees and no refund is due."
        }`,
        data: { refundableDeposit, lateFees },
      };
    } else {
      const additionalPaymentDue = lateFees - cycleDeposit;

      await prisma.cycleRental.update({
        where: { id: rental.id },
        data: {
          actualReturnTime,
          totalFare: rental.totalFare + lateFees,
          balanceDue: additionalPaymentDue,
          paymentStatus: "Unsettled",
        },
      });

      return {
        message: `Cycle returned successfully. Late fees exceeded the deposit. An additional payment of €${additionalPaymentDue.toFixed(
          2
        )} is required and will be collect in hand.`,
        data: { additionalPaymentDue, lateFees },
      };
    }
  }

  private async handleBadCycle(
    rental: any,
    actualReturnTime: Date,
    userId: number,
    cookies: string
  ): Promise<{ message: string; data: any }> {
    const { expectedReturnTime, cycle } = rental;
    const deposit = cycle.deposit ?? cycle.model.deposit;
    const cycleHourRate = cycle.hourlyRate ?? cycle.model.hourlyRate;

    const extraHours = Math.max(
      0,
      (actualReturnTime.getTime() - expectedReturnTime.getTime()) /
        (1000 * 60 * 60)
    );

    const lateFees = extraHours * (cycleHourRate || 0);
    const cycleDeposit = deposit || 0;

    if (lateFees <= cycleDeposit) {
      const refundableDeposit = cycleDeposit - lateFees;

      await prisma.cycleRental.update({
        where: { id: rental.id },
        data: {
          actualReturnTime,
          totalFare: rental.totalFare + lateFees,
          balanceDue: 0.0,
          paymentStatus: "Unsettled",
        },
      });

      return {
        message: `Cycle returned successfully. ${
          refundableDeposit > 0
            ? `Refund of €${refundableDeposit.toFixed(
                2
              )} needs to be done, but the company team will contact you regarding the cycle damage.`
            : `No refund due, but the company team will contact you regarding the cycle damage.`
        }`,
        data: { refundableDeposit, lateFees },
      };
    } else {
      const additionalPaymentDue = lateFees - cycleDeposit;

      await prisma.cycleRental.update({
        where: { id: rental.id },
        data: {
          actualReturnTime,
          totalFare: rental.totalFare + lateFees,
          balanceDue: additionalPaymentDue,
          paymentStatus: "Unsettled",
        },
      });

      return {
        message: `Cycle returned successfully. Late fees exceeded the deposit. An additional payment of €${additionalPaymentDue.toFixed(
          2
        )} is required and will be collected in hand. Also, the company team will contact you regarding the cycle damage.`,
        data: { additionalPaymentDue, lateFees },
      };
    }
  }
}

export default new CycleService();
