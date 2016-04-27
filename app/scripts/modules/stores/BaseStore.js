'use strict';

var AppDispatcher = require('../dispatcher/Dispatcher');
var EventEmitter = require('events').EventEmitter;

/**
 * Prototype of a Store, let others inherit from it.
 **/

var CHANGE_EVENT = 'change';

/* Merge our store with Node's Event Emitter */
class BaseStore extends EventEmitter {
    constructor() {
        this._dispatchToken = null;
    }

    /* I found this version of emitChange here:
        http://www.code-experience.com/async-requests-with-react-js-and-flux-revisited/#comment-1679215406
       and it solves the Invariant Violation problem that occurs when an emitChange() is triggered a the same
       time as an action.
       The original function was just
          emitChange() { this.emit(CHANGE_EVENT); }
     */
    emitChange() {
        process.nextTick(() => this.emit(CHANGE_EVENT));
    }
    addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback);
    }
    removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
    subscribe(actionSubscribe) {
        this._dispatchToken = AppDispatcher.register(actionSubscribe());
    }
    getDispatchToken() {
        return this._dispatchToken;
    }
}


module.exports = BaseStore;

