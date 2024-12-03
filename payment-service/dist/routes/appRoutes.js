"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentRoutes_1 = __importDefault(require("./paymentRoutes"));
const appRoutes = (0, express_1.Router)();
appRoutes.use("/payments", paymentRoutes_1.default);
exports.default = appRoutes;
