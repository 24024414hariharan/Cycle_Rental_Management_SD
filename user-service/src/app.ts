import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import appRouter from "./routes/appRoutes";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

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

app.use("/api", appRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});
