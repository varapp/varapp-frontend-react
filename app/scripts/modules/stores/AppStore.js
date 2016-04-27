'use strict';

/* Stores */
var BaseStore = require('./BaseStore');
var VariantStore = require('./VariantStore');
var SamplesStore = require('./SamplesStore');
var FilterStore = require('./FilterStore');
var LogStore = require('./LogStore');
var LookupStore = require('./LookupStore');
var RouterStore = require('./RouterStore');

/* Constants */
var AppConstants = require('../constants/AppConstants');
var ApiConstants = require('../constants/ApiConstants');
var SamplesConstants = require('../constants/SamplesConstants');
var FilterConstants = require('../constants/FilterConstants');
var VariantConstants = require('../constants/VariantConstants');
var LoginConstants = require('../constants/LoginConstants');

/* Action creators */
var SamplesActions = require('../actions/SamplesActions');
var VariantActions = require('../actions/VariantActions');
var FilterActions = require('../actions/FilterActions');


/**
 * Stores what is common to the dispaly of all submodules (filters, samples, variants, log),
 * for instance the current database in use.
 *
 * It emits changes only when App.js must re-render: db changes, [user changes?],
 * stores reload (e.g. stores init, or go to bookmark).
 **/

class AppStore extends BaseStore {
    constructor() {
        this.init(null);
        this._query = null;
        this.subscribe(() => this._registerToActions.bind(this));
    }
    init(db) {
        this._db = db;
        /* This store state */
        this._storesReady = false;
        this._isLoadingStores = false;
        /* Individual stores states */
        this._samplesReady = false;
        this._filtersReady = false;
        this._bookmarksReady = false;
    }
    getDb() { return this._db; }
    storesReady() { return this._storesReady; }
    isLoadingStores() { return this._isLoadingStores; }

    /* Synchronize the stores: emit change only when all REST calls (except variants query) are finished */
    synchronizeStores() {
        if (this._samplesReady && this._filtersReady && this._bookmarksReady) {
            this._storesReady = true;
            this._isLoadingStores = false;
            this.emitChange();
        }
    }

    /* When we go to a bookmark, no need to reacalculate stats, bookmarks, samples etc.
       because the db did not change. */
    loadState(query) {
        var db = this._db;
        localStorage.setItem('query', JSON.stringify(query));
        RouterStore.init(query);
        LookupStore.init(db);
        SamplesStore.init(db);
        VariantStore.init(db, query.order_by, query.columns);
        FilterStore.init(db, query.filter);
    }

    /* When the db changes, one does not want to keep the same parameters, so reset everything.
       urlQuery: the object that react-router understands as 'query', i.e. an object of the form
       {samples: [str1, str2, ...], filter: [genotype=active, quality=12, ...], ...}
    */
    resetStores(db, query) {
        this._db = db;
        this.loadState(query);
        LogStore.init(db);
        /* Async */
        this.init(db);
        if (!db) {return;}
        this._storesReady = false;  // in case they had already been loaded before
        this._isLoadingStores = true;
        this.emitChange();  // notify App.js that we are going to reload stores
        setTimeout(function() {
            SamplesActions.fetchSamples(db, query.samples);
            FilterActions.fetchGlobalStats(db);
            VariantActions.fetchBookmarks(db);
        }, 0);
    }

    _registerToActions(payload) {
        switch (payload.actionType) {

            case LoginConstants.ACTION_LOGOUT_USER:
                console.log("AppStore :: ACTION_LOGOUT_USER");
                this.init(null);
                this.loadState({});
                localStorage.removeItem('query');
                break;

            case AppConstants.ACTION_CHANGE_DATABASE:
                if (payload.db !== this._db) {
                    console.log("AppStore :: ACTION_CHANGE_DATABASE");
                    var localPrefs = JSON.parse(localStorage.getItem('preferences')) || {};
                    this.resetStores(payload.db, {columns: localPrefs.columns});
                }
                break;

            case AppConstants.ACTION_GOTO_BOOKMARK:
                console.log("AppStore :: ACTION_GOTO_BOOKMARK");
                this.loadState(payload.query);
                break;

            /* Check that all REST calls (except variants query) finished */

            case SamplesConstants.ACTION_FETCH_SAMPLES:
                if (payload.state === ApiConstants.SUCCESS) {
                    this._samplesReady = true;
                    this.synchronizeStores();
                } break;
            case FilterConstants.ACTION_FETCH_GLOBAL_STATS:
                if (payload.state === ApiConstants.SUCCESS) {
                    this._filtersReady = true;
                    this.synchronizeStores();
                } break;
            case VariantConstants.ACTION_FETCH_BOOKMARKS:
                if (payload.state === ApiConstants.SUCCESS) {
                    this._bookmarksReady = true;
                    this.synchronizeStores();
                } break;

            default:
                return true;
        }
        return true;
    }
}


module.exports = new AppStore();
