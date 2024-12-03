import dotenv from "dotenv";
dotenv.config();
import express from "express";
import appRoutes from "./routes/appRoutes";
import webhookRouter from "./routes/webhookRoutes";
import { errorHandler } from "./middleware/errorHandler";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { SubscriptionObserver } from "./observers/SubscriptionObserver";
import { paymentEventSubject } from "./observers/PaymentEventSubject";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8000",
      "http://localhost:7000",
      "http://localhost:4000",
      "http://localhost:6000",
    ], // Allowed origins
    credentials: true, // Allow cookies to be sent
  })
);

// Middleware for structured logs
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

// Add observers to the PaymentEventSubject
const subscriptionObserver = new SubscriptionObserver();

paymentEventSubject.addObserver(subscriptionObserver);

console.log("Observers added to PaymentEventSubject.");

// Webhook routes
app.use("/api/webhooks", webhookRouter);

// General JSON parsing middleware for non-webhook routes
app.use(express.json());

// App routes
app.use("/api", appRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
