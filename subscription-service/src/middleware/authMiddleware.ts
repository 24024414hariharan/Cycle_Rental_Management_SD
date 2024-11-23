import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check the token from the Authorization header or cookies
  const authHeader = req.headers.authorization;
  const tokenFromCookie = req.cookies?.token;

  console.log(tokenFromCookie);

  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; // Extract token from header
  } else if (tokenFromCookie) {
    token = tokenFromCookie; // Use token from cookies if available
  }

  console.log(token);

  if (!token) {
    throw new AppError("Unauthorized: Token missing.", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = { userId: decoded.userId }; // Attach decoded userId to req.user
    next();
  } catch (error) {
    throw new AppError("Unauthorized: Invalid token.", 401);
  }
};
