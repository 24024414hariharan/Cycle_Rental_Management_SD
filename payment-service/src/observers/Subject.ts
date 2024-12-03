// src/observers/Subject.ts
import { Observer } from "./Observer";

export interface Subject {
  addObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notify(event: string, paymethod: string, data: any): Promise<void>;
}
