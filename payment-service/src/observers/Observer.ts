export interface Observer {
  update(event: string, paymethod: string, data: any): Promise<void>;
}
