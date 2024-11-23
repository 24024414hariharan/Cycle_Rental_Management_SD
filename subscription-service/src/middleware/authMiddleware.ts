import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const tokenFromCookie = req.cookies?.token;

  console.log(tokenFromCookie);

  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; 
  } else if (tokenFromCookie) {
    token = tokenFromCookie; 
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
    req.user = { userId: decoded.userId }; 
  } catch (error) {
    throw new AppError("Unauthorized: Invalid token.", 401);
  }
};
