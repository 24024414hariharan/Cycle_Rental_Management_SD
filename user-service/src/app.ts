import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import appRouter from "./routes/appRoutes";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
app.disable('x-powered-by');

app.use(
  cors({
    origin: [
      `${process.env.cycleDomain}`,
      `${process.env.paymentDomain}`,
      `${process.env.subscriptionDomain}`,
    ],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use("/api", appRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});
