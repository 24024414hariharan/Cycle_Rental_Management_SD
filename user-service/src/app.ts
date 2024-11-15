import express, { Request, Response } from "express";
import dotenv from "dotenv";
import appRouter from "./routes/appRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", appRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});
