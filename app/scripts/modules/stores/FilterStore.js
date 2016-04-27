'use strict';

var BaseStore = require('./BaseStore');
var FilterList = require('../react/filters/FilterList');
var FilterCollection = require('../models/FilterCollection');

var FilterConstants = require('../constants/FilterConstants');
var VariantConstants = require('../constants/VariantConstants');
var ApiConstants = require('../constants/ApiConstants');

var _ = require('lodash');
var toastr = require('toastr');


/**
 * This store describes the content of the Filter selectors.
 * Its internal data consists of a collection of filters and their parameters,
 *   that is used to generate a URL to get the variants,
 * and of stats. There are global stats representing the whole non-filtered dataset,
 *   and stats describing the variants we selected with filters.
 **/

/* Init the _filterCollection according to FilterList.js */
var initFilterCollection = function() {
    var _filterCollection = new FilterCollection();
    /* Define groups based on FilterList */
    _.each(FilterList.filter_groups, function (g) {
        _filterCollection.addGroup(g);
    });
    /* Defined filters based on FilterList */
    _.each(FilterList.filters, function (f) {
        _filterCollection.add(f);
    });
    return _filterCollection;
};

var _filterCollection = initFilterCollection(); // VariantStore buildGroupStrings on this right away


class FilterStore extends BaseStore {
    constructor() {
        this.init(null, null);
        this._globalStats = null;
        this._isReady = false;
        this.subscribe(() => this._registerToActions.bind(this));
    }

    /* Getters */
    getFilterCollection() { return _filterCollection; }
    globalStatsAreSet() { return !! this._globalStats; }
    getFilter(field) { return _filterCollection.get(field); }
    getGlobalStats() { return this._globalStats; }
    filtersChanged() { return this._filtersChanged; }
    isReady() { return this._isReady; }
    getDb() { return this._db; }

    /* Setters */
    unsetGlobalStats() { this._globalStats = null; }
    setFiltersChanged(v) { this._filtersChanged = v; }

    /* Take the 'filter' query as returned by the router: ['filter=dbsnp=1', 'filter=frequency<2', ...]',
       and return an array of triplets [('dbsnp','=',1), ('frequency','<',2), ...] */
    parseQueryString(params) {
        var re = /([^<=>]+?)([<=>]+)([^<=>]+)/;
        var parsed = _.map(params, function (par) {
            return re.exec(par).slice(1);
        });
        return parsed;
    }

    /* Make sure that arguments passed by URL or localStorage are valid,
       otherwise warn and ignore them.
       @filterTuples: as parsed above from url query. */
    validateFilters(filterTuples) {
        var validFields = _.map(FilterList.filters, 'field');
        var invalid = [];
        _.forEach(filterTuples, function(f) {
            var fname = f[0];
            if (validFields.indexOf(fname) < 0) {
                invalid.push(f);
            }
        });
        _.pullAll(filterTuples, invalid);
        if (invalid.length > 0) {
            var invalids = _.map(invalid, function(f) {return f.join('');}).join(', ');
            toastr.warning('Ignored invalid filters: '+invalids);
        }
        return filterTuples;
    }

    /**
     * Set filters values according to given params passed by URL query, if any.
     * @params: as returned by the router, a list ['filter=dbsnp=1', 'filter=frequency<2', ...]
     **/
    init(db, params) {
        _filterCollection = initFilterCollection();
        this._db = db;
        this._filtersChanged = true;
        /* Restore filters params from given URL */
        if (params) {
            var parsed = this.parseQueryString(params);
            parsed = this.validateFilters(parsed);
            _.forEach(parsed, function (p) {
                _filterCollection.setValue(p[0], p[2]);
            });
        }
        /* If not set, use defaults */
        /*else {
            _filterCollection
                .setValue('filter', 'PASS')
                .setValue('aaf_1kg_all',0.01)
            ;
        }*/
        /* Some must have a value anyways */
        if (_filterCollection.getValue('genotype') === undefined) {
            _filterCollection.setValue('genotype', 'active');
        }
        this.updateGlobalStats();
    }

    /* Update the filtersCollection with global stats */
    updateGlobalStats() {
        if (! this._globalStats) {
            return;
        }
        _.forEach(this._globalStats.stats, function (v, field) {
            if (_filterCollection.get(field) !== undefined) {
                _filterCollection.get(field).globalStats = v;
            } else {
                console.warn("Received global stats for unknown field "+ field);
            }
        });
        _filterCollection.setCount(FilterConstants.COUNT_TOTAL, this._globalStats.total_count);
    }

    /* Update the filtersCollection with stats of the current variants selection */
    updateLocalStats(data) {
        _.forEach(data.stats, function (v, field) {
            if (_filterCollection.get(field) !== undefined) {
                _filterCollection.get(field).stats = v;
            } else {
                //console.warn("Received stats for unknown field " + field + '.');
            }
        });
        _filterCollection.setCount(FilterConstants.COUNT_FILTERED, data.total_count);
    }

    /**
     * Set value of filter *field* to *value*.
     * The setTimeout is a hack to trigger a new action right away, which is usually
     * not allowed with Flux, but in this case is harmless and practical.
     **/
    updateOneFilterValue(field, value) {
        if (_filterCollection.getValue(field) !== value) {
            _filterCollection.setValue(field, value);
        }
    }

    /**
     * The Filters data changes at only one occasion: when the variants set has changed,
     *   either because of a filter change or a change in samples selection.
     **/
    _registerToActions(payload) {
        switch (payload.actionType) {

            case FilterConstants.ACTION_FETCH_GLOBAL_STATS:
                if (payload.state === ApiConstants.PENDING) {
                    //console.log("FilterStore :: ACTION_FETCH_GLOBAL_STATS (PENDING)");
                    this._isReady = false;
                    this._globalStats = null;
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.SUCCESS) {
                    console.log("FilterStore :: ACTION_FETCH_GLOBAL_STATS");
                    this._globalStats = payload.globalStats;
                    this.updateGlobalStats();
                    this._isReady = true;
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.ERROR) {
                    this._isReady = true;
                    this.emitChange();
                }
                break;

            /* When variants are queried, get the stats - but do not query variants again! */

            case VariantConstants.ACTION_FETCH_VARIANTS:
                if (payload.state === ApiConstants.SUCCESS) {
                    console.log("FilterStore :: ACTION_FETCH_VARIANTS (get stats)");
                    this.updateLocalStats(payload.data.stats);
                    this._filtersChanged = false;
                    this.emitChange();
                }
                break;

            /* These actions trigger a variants query */

            case FilterConstants.ACTION_UPDATE_ONE_FILTER_VALUE:
                this.updateOneFilterValue(payload.field, payload.value);
                this._filtersChanged = true;
                this.emitChange();
                break;

            case FilterConstants.ACTION_FILTERS_RESET:
                this.init(this._db);
                this.updateGlobalStats();
                this._filtersChanged = true;
                this.emitChange();
                break;

            default:
                return true;
        }
        return true;
    }
}


module.exports = new FilterStore();

