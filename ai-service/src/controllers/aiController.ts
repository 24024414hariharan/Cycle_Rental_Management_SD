import { Request, Response } from "express";
import AIService from "../services/aiService";
import { CycleStatusRequestDTO } from "../dtos/cycleStatusRequestDTO";

export const sendCycleStatus = async (req: Request, res: Response) => {
  const { cycleId }: CycleStatusRequestDTO = req.body;

  try {
    let status = await AIService.checkCycleStatus(cycleId);
    return res.status(200).json({ status: status });
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.message || "Failed to send email.";
    return res.status(statusCode).json({ error: errorMessage });
  }
};
