"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
// Custom error class for operational errors
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Middleware for centralized error handling
const errorHandler = (err, req, res, next) => {
    // Determine if the error is an instance of AppError
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err instanceof AppError ? err.message : "Internal Server Error";
    // Log errors that are not operational for debugging
    if (!(err instanceof AppError)) {
        console.error(err.stack || err);
    }
    res.status(statusCode).json({
        status: "error",
        message,
    });
};
exports.errorHandler = errorHandler;
// Middleware to catch 404 errors
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        status: "error",
        message: "Resource not found",
    });
};
exports.notFoundHandler = notFoundHandler;
