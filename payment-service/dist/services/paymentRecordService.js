"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../clients/prisma"));
class PaymentRecordService {
    async getPaymentRecords(userId) {
        return prisma_1.default.payment.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async savePaymentRecord(userId, method, amount, referenceId, status) {
        return prisma_1.default.payment.create({
            data: {
                userId,
                method,
                amount,
                referenceId,
                status,
            },
        });
    }
}
exports.default = new PaymentRecordService();
