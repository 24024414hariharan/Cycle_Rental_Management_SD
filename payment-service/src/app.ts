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
import { CycleRentalObserver } from "./observers/CycleRentalObserver";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8000",
      "http://localhost:7000",
      "http://localhost:4000",
      "http://localhost:6000",
    ],
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

const subscriptionObserver = new SubscriptionObserver();
const cycleRentalObserver = new CycleRentalObserver();

paymentEventSubject.addObserver(subscriptionObserver);
paymentEventSubject.addObserver(cycleRentalObserver);

console.log("Observers added to PaymentEventSubject.");

app.use("/api/webhooks", webhookRouter);

app.use(express.json());

app.use("/api", appRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Payment service is running on port ${PORT}`);
});
