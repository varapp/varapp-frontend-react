'use strict';

var BaseStore = require('./BaseStore');

/* Utils */
var _ = require('lodash');
var toastr = require('toastr');
var formatPosition = require('../utils/formatters').formatPosition;

/* Stores */
var FilterStore = require('../stores/FilterStore');
var SamplesStore = require('../stores/SamplesStore');

/* Constants */
var ApiConstants = require('../constants/ApiConstants');
var SamplesConstants = require('../constants/SamplesConstants');
var VariantConstants = require('../constants/VariantConstants');
var FilterConstants = require('../constants/FilterConstants');
var UtilsConstants = require('../constants/UtilsConstants');
var VariantColumnList = require('../react/variants/VariantColumnList');
var ROW_BATCH_SIZE = VariantConstants.ROW_BATCH_SIZE;
var DESC = UtilsConstants.DESC;
var ASC = UtilsConstants.ASC;
var DEFAULT_COLS = VariantConstants.DEFAULT_COLS;


/* Transform an array [1,2,3] into an set {1:true, 2:true, 3:true} */
var toObj = function(array) {
    var obj = {};
    _.map(array, function(a) {obj[a] = true;});
    return obj;
};


class VariantStore extends BaseStore {
    constructor() {
        this.init(null, null, null);
        this._bookmarks = [];
        this._isLoadingBookmarks = false;
        this.subscribe(() => this._registerToActions.bind(this));
    }

    validateColumns(colNames) {
        var validNames = VariantColumnList.COLUMN_DEF;
        var invalid = [];
        _.forEach(colNames, function(col) {
            if (!(col in validNames)) {
                invalid.push(col);
            }
        });
        _.pullAll(colNames, invalid);
        if (invalid.length > 0) {
            toastr.warning('Ignored invalid column names: '+ invalid.join(','));
        }
        return colNames;
    }

    validateOrderBy(orderBy) {
        var validNames = VariantColumnList.COLUMN_DEF;
        if (!(orderBy in validNames)) {
            var by = 'chrom';
            toastr.warning('Ignored invalid sorting key: '+ by);
        }
        return orderBy;
    }

    init(db, order_by, columns) {
        this._db = db;
        this.data = {variants: null, stats: null, selectedVariants: []};
        this.sortDirection = null;
        this.sortBy = 'chrom';
        this._isCompound = false;  // to display the Source column if compound het
        this._isExporting = false;
        this._isLoadingVariants = false;
        this._isLoadingNextRowBatch = false;
        this._noMoreVariantsToLoad = false;
        this._samplesSortBy = SamplesStore.sortBy;
        this._samplesSortDirection = SamplesStore.sortDirection;
        this._columns = toObj(DEFAULT_COLS);
        if (columns) {
            var cols = columns.split(',');
            cols = this.validateColumns(cols);
            this._columns = toObj(cols);
        }
        if (order_by) {
            var orderSplit = order_by.split(',');
            var orderBy = orderSplit[0];
            this.sortBy = this.validateOrderBy(orderBy);
            this.sortDirection = orderSplit[1];
        }
    }

    /* Getters */

    getDb() { return this._db; }
    getColumns() { return this._columns; }
    getBookmarks() { return this._bookmarks; }
    getSamplesSortBy() { return this._samplesSortBy; }
    getSamplesSortDirection() { return this._samplesSortDirection; }
    isCompound() { return this._isCompound; }
    /* App state getters */
    isLoadingNextRowBatch() { return this._isLoadingNextRowBatch; }
    isLoadingVariants() { return this._isLoadingVariants; }
    noMoreVariantsToLoad() { return this._noMoreVariantsToLoad; }
    isLoadingBookmarks() { return this._isLoadingBookmarks; }
    isExporting() { return this._isExporting; }
    /* Variants getters */
    getVariants() { return this.data.variants; }
    getSelectedVariants() { return this.data.selectedVariants; }
    //getVariantByIndex(idx) { return this.data.variants[idx]; }
    /* Return the total number of filtered variants */
    nVariants() {
        return this.data.stats ? this.data.stats.total_count : 0;
    }
    /* Return the number of variants **in the store**, usually a batch of ~300 */
    size() {
        return this.data.variants ? this.data.variants.length : 0;
    }

    /* Build order_by string to pass to the Router */
    buildSortGroupStrings() {
        if (this.sortBy && this.sortDirection) {
            return this.sortBy+','+this.sortDirection;
        } else {
            return null;
        }
    }
    /* Build string to pass to the Router */
    buildColumnsGroupStrings() {
        return _.keys(this._columns).join(',');
    }

    /* Add a 'position' field ('chr2:123-456') to each member of *variants* */
    addPositionField(variants) {
        _.map(variants, function(v) {
            v.position = v.chrom+':'+formatPosition(v.start)+'-'+formatPosition(v.end);
        });
    }

    /* Upon reception of the new variants, set this.data */
    update(data) {
        if (! (SamplesStore.isReady() && FilterStore.isReady())) {
            return;
        }
        /* No need to query variants if there are no active samples */
        if (SamplesStore.size() === 0) {
            return;
        }
        this._noMoreVariantsToLoad = data.variants.length < ROW_BATCH_SIZE;
        this._isCompound = FilterStore.getFilter('genotype').value === 'compound_het';
        this.addPositionField(data.variants);
        this.data = data;
    }

    /**
     * Upon reception of the next variants batch, append it to this.data.varaints
     */
    appendNextRowBatch(data) {
        var nVariants = data.variants.length;
        this._noMoreVariantsToLoad = nVariants < ROW_BATCH_SIZE;
        if (nVariants.length === 0) {
            return;
        }
        this.addPositionField(data.variants);
        this.data.variants = this.data.variants.concat(data.variants);
    }

    /* For a selection, sort locally
       Otherwise use backend sort, as we dont load all variants together */
    setSortParams(sortBy) {
        var sortDirection = this.sortDirection;
        if (sortBy === this.sortBy) {
            sortDirection = this.sortDirection === DESC ? ASC : DESC;
        } else {
            sortDirection = ASC;
        }
        this.sortDirection = sortDirection;
        this.sortBy = sortBy;
    }

    addOrRemoveColumn(field, add) {
        if (add) {
            this._columns[field] = true;
        } else {
            delete this._columns[field];
        }
        localStorage.setItem('preferences', JSON.stringify({
            columns: this.buildColumnsGroupStrings()
        }));
        this.emitChange();
    }

    /**
     * New variants must be queried when filters change (may be due to the samples selection).
     * Moreover this store, which controls what is to be displayed it the VariantsTable,
     * must react to changes such as
     * - Sorting the variants
     * - Loading the next batch of 1000 or so variants.
     **/
    _registerToActions(payload) {
        switch (payload.actionType) {

            case VariantConstants.ACTION_FETCH_VARIANTS:
                if (payload.state === ApiConstants.PENDING) {
                    //console.log("VariantStore :: ACTION_FETCH_VARIANTS (PENDING)");
                    this._isLoadingVariants = true;
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.SUCCESS) {
                    console.log("VariantStore :: ACTION_FETCH_VARIANTS");
                    this._isLoadingVariants = false;
                    this.update(payload.data);
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.ERROR) {
                    this._isLoadingVariants = false;
                    this.emitChange();
                }
                break;

            case VariantConstants.ACTION_LOAD_NEXT_ROW_BATCH:
                if (payload.state === ApiConstants.PENDING) {
                    //console.log("VariantStore :: ACTION_LOAD_NEXT_ROW_BATCH (PENDING)");
                    this._isLoadingNextRowBatch = true;
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.SUCCESS) {
                    console.log("VariantStore :: ACTION_LOAD_NEXT_ROW_BATCH");
                    this._isLoadingNextRowBatch = false;
                    this.appendNextRowBatch(payload.data);
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.ERROR) {
                    this._isLoadingNextRowBatch = false;
                    this.emitChange();
                }
                break;

            case VariantConstants.ACTION_EXPORT_VARIANTS:
                if (payload.state === ApiConstants.PENDING) {
                    //console.log("VariantStore :: ACTION_EXPORT_VARIANTS (PENDING)");
                    this._isExporting = true;
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.SUCCESS) {
                    console.log("VariantStore :: ACTION_EXPORT_VARIANTS");
                    this._isExporting = false;
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.ERROR) {
                    this._isExporting = false;
                    this.emitChange();
                }
                break;

            case VariantConstants.ACTION_FETCH_BOOKMARKS:
                if (payload.state === ApiConstants.PENDING) {
                    //console.log("VariantStore :: ACTION_FETCH_BOOKMARKS (PENDING)");
                    this._isLoadingBookmarks = true;
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.SUCCESS) {
                    console.log("VariantStore :: ACTION_FETCH_BOOKMARKS");
                    var bookmarks = payload.bookmarks;
                    bookmarks.reverse();
                    this._bookmarks = bookmarks;
                    this._isLoadingBookmarks = false;
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.ERROR) {
                    this._isLoadingBookmarks = false;
                    this.emitChange();
                }
                break;

            /* Update this.sortBy and this.sortDirection */
            case VariantConstants.ACTION_SORT_VARIANTS:
                this.setSortParams(payload.sortBy);
                break;

            /* When filters reset, just reset the sorting as well */
            case FilterConstants.ACTION_FILTERS_RESET:
                console.log("VariantStore :: ACTION_FILTERS_RESET");
                this.sortDirection = null;
                this.sortBy = 'chrom';
                break;

            /* When samples are sorted, sort the genotypes */
            case SamplesConstants.ACTION_SORT_SAMPLES:
                console.log("VariantStore :: ACTION_SORT_SAMPLES");
                this._samplesSortBy = payload.by;
                this._samplesSortDirection = payload.dir;
                break;

            case VariantConstants.ACTION_ADD_OR_REMOVE_COLUMN:
                this.addOrRemoveColumn(payload.field, payload.add);
                break;

            default:
                return true;
        }
        return true;
    }
}


module.exports = new VariantStore();
