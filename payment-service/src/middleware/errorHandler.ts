import { Request, Response, NextFunction } from "express";

// Custom error class for operational errors
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware for centralized error handling
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Determine if the error is an instance of AppError
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "Internal Server Error";

  // Log errors that are not operational for debugging
  if (!(err instanceof AppError)) {
    console.error(err.stack || err);
  }

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

// Middleware to catch 404 errors
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
};
