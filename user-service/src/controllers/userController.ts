import { Request, Response, NextFunction } from "express";
import userService from "../services/userService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { AppError } from "../middleware/errorHandler";
import { generateSessionToken } from "../utils/tokenUtil";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed.", 400));
  }

  try {
    await userService.register(req.body);
    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification.",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed.", 400));
  }

  const { email, password } = req.body;

  try {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Invalid credentials.", 400));
    }

    if (!user.isVerified) {
      return next(new AppError("Email not verified.", 403));
    }

    const token = generateSessionToken(user.id.toString());
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return next(new AppError("Verification token is required.", 400));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    await userService.verifyEmail(decoded.userId);
    res.json({ message: "Email verified successfully." });
  } catch (error: any) {
    return next(new AppError("Invalid or expired verification token.", 400));
  }
};
