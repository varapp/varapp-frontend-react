'use strict';

var BaseStore = require('./BaseStore');
var AdminConstants = require('../constants/AdminConstants');
var ApiConstants = require('../constants/ApiConstants');


class AdminStore extends BaseStore {
    constructor() {
        this._databases = null;
        this._users = null;
        this._roles = null;
        this._isReady = false;
        this.subscribe(() => this._registerToActions.bind(this));
    }

    getDatabases() {
        return this._databases;
    }
    getUsers() {
        return this._users;
    }
    getRoles() {
        return this._roles;
    }
    isReady() {
        return this._isReady;
    }

    _registerToActions(payload) {
        switch (payload.actionType) {
            case AdminConstants.ACTION_FETCH_USERS_INFO:
                if (payload.state === ApiConstants.PENDING) {
                    //console.log("AdminStore :: ACTION_FETCH_USERS_INFO (PENDING)");
                    this._isReady = false;
                    this.emitChange();
                }
                if (payload.state === ApiConstants.SUCCESS) {
                    console.log("AdminStore :: ACTION_FETCH_USERS_INFO");
                    this._databases = payload.data.databases;
                    this._users = payload.data.users;
                    this._roles = payload.data.roles;
                    this._isReady = true;
                    this.emitChange();
                }
                break;

            default:
                return true;
        }
        return true;
    }
}


module.exports = new AdminStore();
