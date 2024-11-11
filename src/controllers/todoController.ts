import { Request, Response, NextFunction } from "express";
import { todoModel } from "../models/todoModel";
import { AppError } from "../middlewares/errorHandler";

export const todoController = {
    getTasks: (req: Request, res: Response, next: NextFunction): void => {
        try {
            const tasks = todoModel.getAllTasks();
            res.send({ tasks });
        } catch (error) {
            next(new AppError("Failed to fetch tasks", 500));
        }
    },

    addTask: (req: Request, res: Response, next: NextFunction): void => {
        try {
            const task = req.body.task;
            if (!task) {
                throw new AppError("Task content cannot be empty", 400);
            }
            todoModel.addTask(task);
            res.send("Task added Successfully")
        } catch (error) {
            next(error instanceof AppError ? error : new AppError("Failed to add task", 500));
        }
    }
};
