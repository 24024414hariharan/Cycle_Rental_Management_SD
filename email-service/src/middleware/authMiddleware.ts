import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/tokenUtil";
import { AppError } from "./errorHandler";

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : tokenFromCookie;

    if (!token) throw new AppError("Unauthorized: Token missing.", 401);

    const decoded = verifyToken(token);
    req.user = {
      userId: Number(decoded.userId),
      role: decoded.role || "CUSTOMER",
    };
    next();
  } catch (error) {
    next(new AppError("Unauthorized: Invalid token.", 401));
  }
};

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      throw new AppError("Unauthorized: Insufficient permissions.", 403);
    }
    next();
  };
};
