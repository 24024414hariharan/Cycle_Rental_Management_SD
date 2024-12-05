import { Request, Response, NextFunction } from "express";
import cycleService from "../services/cycleService";
import { CycleModelBuilder } from "../builders/cycleModelBuilder";
import { CycleBuilder } from "../builders/cycleBuilder";
import { AppError } from "../middleware/errorHandler";
import { asyncHandler } from "../utils/asyncHandler";

export const addCycleModel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, brand, hourlyRate, deposit } = req.body;

    // Build the CycleModel DTO using the builder pattern
    const model = new CycleModelBuilder()
      .setType(type)
      .setBrand(brand)
      .setHourlyRate(hourlyRate)
      .setDeposit(deposit)
      .build();

    const newModel = await cycleService.addCycleModel(model);

    res.status(201).json({
      message: "Cycle model added successfully.",
      data: newModel,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getCycleModels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const models = await cycleService.getAllCycleModels();

    res.status(200).json({
      message: "Cycle models fetched successfully.",
      data: models,
    });
  } catch (error: any) {
    next(error);
  }
};

export const addCycle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { modelId, condition, status, location, hourlyRate, deposit } =
      req.body;

    const cycle = new CycleBuilder()
      .setModelId(modelId)
      .setCondition(condition)
      .setStatus(status)
      .setLocation(location)
      .setHourlyRate(hourlyRate)
      .setDeposit(deposit)
      .build();

    const newCycle = await cycleService.addCycle(cycle);

    res.status(201).json({
      message: "Cycle added successfully.",
      data: newCycle,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAllCycles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, brand, status, location } = req.query;

    const filters = {
      type: type as string,
      brand: brand as string,
      status: status as string,
      location: location as string,
    };

    const cycles = await cycleService.getAllCycles(filters);

    res.status(200).json({
      message: "Cycles fetched successfully.",
      data: cycles,
    });
  } catch (error: any) {
    next(error);
  }
};

export const calculateFare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cycleId, rentalHours } = req.body;
    const cookies = req.headers.cookie || "";
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Unauthorized: User information missing.", 401);
    }

    if (!cookies) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const fare = await cycleService.calculateFare(
      cycleId,
      rentalHours,
      cookies,
      userId
    );
    res.json({
      status: "success",
      message: "Fare calculated successfully.",
      data: fare,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getRentalDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rentalId = parseInt(req.params.rentalId);

    if (isNaN(rentalId)) {
      return res.status(400).json({ message: "Invalid rental ID" });
    }

    const rentalDetails = await cycleService.getRentalDetailsById(rentalId);

    res.status(200).json({
      message: "Rental details fetched successfully.",
      data: rentalDetails,
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleSubscriptionWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, status, rentalID } = req.body;
    const cookies = req.headers.cookie || "";

    if (!userId || !status) {
      throw new AppError(
        "Invalid webhook payload: userId or status missing.",
        400
      );
    }

    // Update the subscription status based on webhook data
    await cycleService.handleSubscriptionWebhook(
      userId,
      status,
      cookies,
      rentalID
    );

    res.status(200).json({
      status: "success",
      message: "Subscription status updated from webhook.",
    });
  }
);
