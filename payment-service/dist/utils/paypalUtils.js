"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
const getAccessToken = async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal client credentials in environment variables.");
    }
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    try {
        const response = await axios_1.default.post("https://api-m.sandbox.paypal.com/v1/oauth2/token", "grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return response.data.access_token;
    }
    catch (error) {
        console.error("Error fetching PayPal access token:", error.message || error);
        throw new Error("Failed to fetch PayPal access token.");
    }
};
exports.getAccessToken = getAccessToken;
