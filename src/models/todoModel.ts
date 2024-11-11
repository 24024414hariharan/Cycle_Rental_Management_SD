import { TaskDto } from "../dto/taskDto";

export class TodoModel {
  private tasks: TaskDto[] = [];

  // Method to retrieve all tasks
  public getAllTasks(): TaskDto[] {
    return this.tasks.map((task) => new TaskDto(task.id, task.task));
  }

  // Method to add a new task
  public addTask(task: string): void {
    this.tasks.push({ id: this.tasks.length + 1, task });
  }
}

// Export an instance of the TodoModel class for use in other parts of the app
export const todoModel = new TodoModel();
