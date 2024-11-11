import { TodoModel } from "../../src/models/todoModel";
import { TaskDto } from "../../src/dto/taskDto";

describe("TodoModel", () => {
    let todoModel: TodoModel;

    beforeEach(() => {
        todoModel = new TodoModel();
    });

    test("getAllTasks should return an empty array initially", () => {
        const tasks = todoModel.getAllTasks();
        expect(tasks).toEqual([]);
    });

    test("addTask should add a new task", () => {
        todoModel.addTask("New Task");
        const tasks = todoModel.getAllTasks();
        expect(tasks.length).toBe(1);
        expect(tasks[0]).toEqual(new TaskDto(1, "New Task"));
    });

    test("getAllTasks should return all added tasks", () => {
        todoModel.addTask("Task 1");
        todoModel.addTask("Task 2");
        const tasks = todoModel.getAllTasks();
        expect(tasks.length).toBe(2);
        expect(tasks[0]).toEqual(new TaskDto(1, "Task 1"));
        expect(tasks[1]).toEqual(new TaskDto(2, "Task 2"));
    });
});
