"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.validateToken = void 0;
const tokenUtil_1 = require("../utils/tokenUtil");
const errorHandler_1 = require("./errorHandler");
const validateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const tokenFromCookie = req.cookies?.token;
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : tokenFromCookie;
        if (!token)
            throw new errorHandler_1.AppError("Unauthorized: Token missing.", 401);
        const decoded = (0, tokenUtil_1.verifyToken)(token);
        req.user = {
            userId: Number(decoded.userId),
            role: decoded.role || "CUSTOMER",
        };
        console.log(req.user.userId);
        next();
    }
    catch (error) {
        next(new errorHandler_1.AppError("Unauthorized: Invalid token.", 401));
    }
};
exports.validateToken = validateToken;
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || "")) {
            throw new errorHandler_1.AppError("Unauthorized: Insufficient permissions.", 403);
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
