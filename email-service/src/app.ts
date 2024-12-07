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

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Email service is running on port ${PORT}`);
});
