export class TaskDto {
    id: number;
    task: string;

    constructor(id: number, task: string) {
        this.id = id;
        this.task = task;
    }
}
