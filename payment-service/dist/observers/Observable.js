"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = void 0;
class Observable {
    constructor() {
        this.observers = {};
    }
    addObserver(eventType, observer) {
        if (!this.observers[eventType]) {
            this.observers[eventType] = [];
        }
        this.observers[eventType].push(observer);
    }
    removeObserver(eventType, observer) {
        if (!this.observers[eventType])
            return;
        this.observers[eventType] = this.observers[eventType].filter((obs) => obs !== observer);
    }
    notifyObservers(eventType, data) {
        if (!this.observers[eventType])
            return;
        this.observers[eventType].forEach((observer) => observer.update(eventType, data));
    }
}
exports.Observable = Observable;
