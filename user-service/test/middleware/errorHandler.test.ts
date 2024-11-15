import { Request, Response, NextFunction } from "express";
import {
  errorHandler,
  notFoundHandler,
  AppError,
} from "../../src/middleware/errorHandler";

describe("errorHandler Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should handle operational errors (AppError) correctly", () => {
    const error = new AppError("Operational error", 400);
    errorHandler(error, mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      message: "Operational error",
    });
  });

  it("should handle non-operational errors with a 500 status code", () => {
    const error = new Error("Unexpected error");
    errorHandler(error, mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      message: "Internal Server Error",
    });
  });

  it("should handle errors when error.response is undefined", () => {
    const error = {
      response: undefined,
    };

    errorHandler(error as any, mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      message: "Internal Server Error",
    });
  });
});

describe("notFoundHandler Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should handle 404 errors correctly", () => {
    notFoundHandler(mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      message: "Resource not found",
    });
  });
});
