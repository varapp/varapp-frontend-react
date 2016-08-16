'use strict';

var BaseStore = require('./BaseStore');
var LogConstants = require('../constants/LogConstants');

/**
 * Stores log infos to display in the LogPanel window.
 **/

class LogStore extends BaseStore {
    constructor() {
        super();
        this._db = null;
        this._content = [];
        this.subscribe(() => this._registerToActions.bind(this));
    }

    init(db) {
        this._db = db;
        this._content = [];
        this.emitChange();
    }
    reset(db) {
        this.init(db);
    }

    getContent() {
        return this._content;
    }
    getDb() {
        return this._db;
    }
    eraseContent() {
        this._content = [];
        this.emitChange();
    }

    error(err) {
        var date = new Date();
        var timestamp = date.toTimeString().split(' ')[0];
        var error;
        if (typeof(err) === 'string') {
            error = err;
        } else {
            error = err.status+' '+err.statusText;
        }
        this._content.push({
            text: error,
            type: 'error',
            time: timestamp,
        });
        this.emitChange();
    }

    warning(msg) {
        var date = new Date();
        var timestamp = date.toTimeString().split(' ')[0];
        this._content.push({
            text: msg,
            type: 'warning',
            time: timestamp
        });
        this.emitChange();
    }

    success(msg) {
        var date = new Date();
        var timestamp = date.toTimeString().split(' ')[0];
        this._content.push({
            text: msg,
            type: 'success',
            time: timestamp
        });
        this.emitChange();
    }

    _registerToActions(payload) {
        switch (payload.actionType) {

            case LogConstants.ACTION_SEND_ERROR:
                this.error(payload.error);
                break;

            case LogConstants.ACTION_SEND_SUCCESS:
                this.success(payload.msg);
                break;

            case LogConstants.ACTION_SEND_WARNING:
                this.warning(payload.msg);
                break;


            default:
                return true;
        }
        return true;
    }

}


module.exports = new LogStore();
