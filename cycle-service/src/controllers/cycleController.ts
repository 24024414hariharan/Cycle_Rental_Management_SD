import { Request, Response, NextFunction } from "express";
import cycleService from "../services/cycleService";

export const calculateFare = async (req: Request, res: Response, next: NextFunction) => {
    const { cycleId, rentalHours } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }
  
    const fare = await cycleService.calculateFare(cycleId, rentalHours, token);
    res.json({
      status: "success",
      message: "Fare calculated successfully.",
      data: fare,
    });
  };
  