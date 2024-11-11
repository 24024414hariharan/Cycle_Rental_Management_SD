import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import todoRoutes from "./routes/todoRoutes";
import { errorHandler, AppError } from "./middlewares/errorHandler";

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(todoRoutes);

// Handle unrecognized routes
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError("Route not found", 404));
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
