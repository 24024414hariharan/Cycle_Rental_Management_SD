import { validateToken, authorizeRoles } from "../../src/middleware/authMiddleware";
import { verifyToken } from "../../src/utils/tokenUtil";
import { AppError } from "../../src/middleware/errorHandler";
import { Request, Response, NextFunction } from "express";

jest.mock("../../src/utils/tokenUtil");

describe("authMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {};
    next = jest.fn();
  });

  describe("validateToken", () => {
    it("should call next if token is valid (from header)", async () => {
      const mockDecodedToken = { userId: 1, role: "ADMIN" };
      (verifyToken as jest.Mock).mockReturnValue(mockDecodedToken);

      req.headers = { authorization: "Bearer validToken" };

      await validateToken(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({ userId: 1, role: "ADMIN" });
    });

    it("should call next if token is valid (from cookie)", async () => {
      const mockDecodedToken = { userId: 2, role: "CUSTOMER" };
      (verifyToken as jest.Mock).mockReturnValue(mockDecodedToken);

      req.cookies = { token: "validToken" };

      await validateToken(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({ userId: 2, role: "CUSTOMER" });
    });

    it("should throw AppError if token is invalid", async () => {
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      req.headers = { authorization: "Bearer invalidToken" };

      await validateToken(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0]).toMatchObject({
        message: "Unauthorized: Invalid token.",
        statusCode: 401,
      });
    });
  });

  describe("authorizeRoles", () => {
    it("should call next if user has sufficient permissions", () => {
      req.user = { role: "ADMIN" } as any;

      const middleware = authorizeRoles(["ADMIN", "SUPERADMIN"]);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
    });

    it("should throw AppError if user has insufficient permissions", () => {
      req.user = { role: "CUSTOMER" } as any;

      const middleware = authorizeRoles(["ADMIN", "SUPERADMIN"]);
      expect(() =>
        middleware(req as Request, res as Response, next as NextFunction)
      ).toThrow(new AppError("Unauthorized: Insufficient permissions.", 403));
    });

    it("should throw AppError if user role is missing", () => {
      req.user = {} as any;

      const middleware = authorizeRoles(["ADMIN", "SUPERADMIN"]);
      expect(() =>
        middleware(req as Request, res as Response, next as NextFunction)
      ).toThrow(new AppError("Unauthorized: Insufficient permissions.", 403));
    });
  });
});
