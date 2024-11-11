import { Request, Response, NextFunction } from "express";

// Basic custom error class
class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware
export const errorHandler = (
    err: AppError | Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const isOperational = err instanceof AppError ? err.isOperational : false;

    res.status(statusCode).json({
        status: "error",
        message: isOperational ? err.message : "Internal Server Error",
    });
};

// Export the AppError class for use in other files
export { AppError };
