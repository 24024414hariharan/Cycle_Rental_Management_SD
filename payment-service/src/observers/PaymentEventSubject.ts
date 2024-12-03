// src/events/PaymentEventSubject.ts
import { Subject } from "../observers/Subject";
import { Observer } from "../observers/Observer";

export class PaymentEventSubject implements Subject {
  private observers: Observer[] = [];

  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  async notify(event: string, paymethod: string, data: any): Promise<void> {
    for (const observer of this.observers) {
      await observer.update(event, paymethod, data);
    }
  }
}

// Exporting a singleton instance of PaymentEventSubject
export const paymentEventSubject = new PaymentEventSubject();
