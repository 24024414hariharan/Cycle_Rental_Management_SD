import { Request, Response, NextFunction } from "express";

// Custom error class for operational errors
class AppError extends Error {
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
  // Determine status code and error type
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "Internal Server Error";

  // Ensure JSON response
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
) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
};

// Export the AppError class
export { AppError };
