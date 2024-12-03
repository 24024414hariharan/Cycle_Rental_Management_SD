"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const appRoutes_1 = __importDefault(require("./routes/appRoutes"));
const webhookRoutes_1 = __importDefault(require("./routes/webhookRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const SubscriptionObserver_1 = require("./observers/SubscriptionObserver");
const PaymentEventSubject_1 = require("./observers/PaymentEventSubject");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:7000",
    ],
    credentials: true,
}));
// Middleware for structured logs
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
app.use((0, cookie_parser_1.default)());
// Add observers to the PaymentEventSubject
const subscriptionObserver = new SubscriptionObserver_1.SubscriptionObserver();
PaymentEventSubject_1.paymentEventSubject.addObserver(subscriptionObserver);
console.log("Observers added to PaymentEventSubject.");
// Webhook routes
app.use("/api/webhooks", webhookRoutes_1.default);
// General JSON parsing middleware for non-webhook routes
app.use(express_1.default.json());
// App routes
app.use("/api", appRoutes_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
