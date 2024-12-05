import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import appRoutes from "./routes/appRoutes";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use("/api", appRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});
