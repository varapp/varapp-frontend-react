'use strict';

var BaseStore = require('./BaseStore');
var AppConstants = require('../constants/AppConstants');


/*
 * Manages URL changes
 */


class RouterStore extends BaseStore {
    constructor() {
        this._query = null;
        this.subscribe(() => this._registerToActions.bind(this));
    }
    init(query) {
        this._query = query;
        this.emitChange();
    }

    getQuery() { return this._query; }

    _registerToActions(payload) {
        switch (payload.actionType) {

            case AppConstants.ACTION_CHANGE_URL:
                //console.log("RouterStore :: ACTION_CHANGE_URL");
                this._query = payload.query;
                localStorage.setItem('query', JSON.stringify(this._query));
                this.emitChange();
                break;

            //case AppConstants.ACTION_CHANGE_LOCATION:
            //    console.log("AppStore :: ACTION_CHANGE_LOCATION");

            default:
                return true;
        }
        return true;
    }
}


module.exports = new RouterStore();
