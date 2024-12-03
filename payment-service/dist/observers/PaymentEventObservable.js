"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("./Observable");
class PaymentEventObservable extends Observable_1.Observable {
    constructor() {
        super();
    }
    static getInstance() {
        if (!PaymentEventObservable.instance) {
            PaymentEventObservable.instance = new PaymentEventObservable();
        }
        return PaymentEventObservable.instance;
    }
}
exports.default = PaymentEventObservable.getInstance();
