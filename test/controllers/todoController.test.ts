import { Request, Response, NextFunction } from "express";
import { todoController } from "../../src/controllers/todoController";
import { todoModel } from "../../src/models/todoModel";
import { AppError } from "../../src/middlewares/errorHandler";

jest.mock("../../src/models/todoModel");

describe("todoController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {};
        res = {
            render: jest.fn(),
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("getTasks should render todoView with tasks data", async () => {
        const tasks = [{ id: 1, task: "Test Task" }];
        (todoModel.getAllTasks as jest.Mock).mockReturnValue(tasks);

        await todoController.getTasks(req as Request, res as Response, next);

        expect(todoModel.getAllTasks).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith({ tasks }); // Check response data
    });

    test("getTasks should call next with error if model fails", async () => {
        (todoModel.getAllTasks as jest.Mock).mockImplementation(() => {
            throw new Error("Database error");
        });

        await todoController.getTasks(req as Request, res as Response, next);

        expect(todoModel.getAllTasks).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(new AppError("Failed to fetch tasks", 500));
    });

    test("addTask should add a task and send success message", async () => {
        req.body = { task: "New Task" };

        await todoController.addTask(req as Request, res as Response, next);

        expect(todoModel.addTask).toHaveBeenCalledWith("New Task");
        expect(res.send).toHaveBeenCalledWith("Task added Successfully");
    });

    test("addTask should call next with error if task is empty", async () => {
        req.body = { task: "" };

        await todoController.addTask(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new AppError("Task content cannot be empty", 400));
    });
});
