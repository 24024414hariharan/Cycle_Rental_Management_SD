"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentEventSubject = exports.PaymentEventSubject = void 0;
class PaymentEventSubject {
    constructor() {
        this.observers = [];
    }
    addObserver(observer) {
        this.observers.push(observer);
    }
    removeObserver(observer) {
        this.observers = this.observers.filter((obs) => obs !== observer);
    }
    async notify(event, paymethod, data) {
        for (const observer of this.observers) {
            await observer.update(event, paymethod, data);
        }
    }
}
exports.PaymentEventSubject = PaymentEventSubject;
// Exporting a singleton instance of PaymentEventSubject
exports.paymentEventSubject = new PaymentEventSubject();
