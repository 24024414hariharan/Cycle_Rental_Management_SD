"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventDispatcher {
    static subscribe(eventType, callback) {
        if (!this.observers[eventType]) {
            this.observers[eventType] = [];
        }
        this.observers[eventType].push(callback);
    }
    static notify(eventType, payload) {
        const callbacks = this.observers[eventType] || [];
        for (const callback of callbacks) {
            callback(payload);
        }
    }
}
EventDispatcher.observers = {};
exports.default = EventDispatcher;
