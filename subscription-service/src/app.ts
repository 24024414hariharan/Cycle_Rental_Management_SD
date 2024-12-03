import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import { errorHandler } from "./middleware/errorHandler";
import appRoutes from "./routes/appRoutes";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8000",
      "http://localhost:7000",
    ], // Allowed origins
    credentials: true, // Allow cookies to be sent
  })
);

app.use(cookieParser());

app.use(express.json());

app.use("/api", appRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Subscription Service is running on port ${PORT}`);
});
