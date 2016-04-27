var BaseStore = require('../stores/BaseStore');
var _ = require('lodash');

var SamplesConstants = require('../constants/SamplesConstants');
var FilterConstants = require('../constants/FilterConstants');
var VariantConstants = require('../constants/VariantConstants');
var ApiConstants = require('../constants/ApiConstants');
var AppConstants = require('../constants/AppConstants');


/*
    Controls when variants should be loaded, i.e. a component listening to this store
    needs to trigger VariantActions.loadVariants() when it is updated.

    The flags this.changed and this.storeReady are unused yet.
 */


class VariantsLoaderStore extends BaseStore {
    constructor() {
        this.changed = {samples: false, filters: false, order: false};
        this.storeReady = {samples: false, filters: false};
        this.subscribe(() => this._registerToActions.bind(this));
    }

    storesReady() {
        return _.every(this.storeReady);
    }

    _registerToActions(payload) {
        switch (payload.actionType) {

            // Load variants when filters change
            case FilterConstants.ACTION_UPDATE_ONE_FILTER_VALUE:
            case FilterConstants.ACTION_FILTERS_RESET:
                this.changed.filters = true;
                this.emitChange();
                break;

            // Load variants when samples change
            case SamplesConstants.ACTION_UPDATE_SAMPLE_GROUP:
            case SamplesConstants.ACTION_UPDATE_SAMPLE_ACTIVE:
            case SamplesConstants.ACTION_UPDATE_FAMILY_ACTIVE:
            case SamplesConstants.ACTION_UPDATE_ALL_ACTIVE:
                this.changed.samples = true;
                this.emitChange();
                break;

            // Load variants when sorting key/direction changed
            case VariantConstants.ACTION_SORT_VARIANTS:
                this.changed.order = true;
                this.emitChange();
                break;

            // Go to bookmark
            case AppConstants.ACTION_GOTO_BOOKMARK:
                this.emitChange();
                break;

            // Finished getting variants: reset change flags
            case VariantConstants.ACTION_FETCH_VARIANTS:
                if (payload.state === ApiConstants.SUCCESS
                 || payload.state === ApiConstants.ERROR) {
                    console.log("VariantsLoaderStore :: ACTION_FETCH_VARIANTS");
                    this.changed = {samples: false, filters: false, order: false};
                }
                break;

            /* Stores that are necessary for loading variants: signal when they are ready */

            // Samples finished loading
            case SamplesConstants.ACTION_FETCH_SAMPLES:
                if (payload.state === ApiConstants.SUCCESS) {
                    this.storeReady.samples = true;
                } break;

            // Filters finished loading stats
            case FilterConstants.ACTION_FETCH_GLOBAL_STATS:
                if (payload.state === ApiConstants.SUCCESS) {
                    this.storeReady.filters = true;
                } break;

            default:
                return true;
        }
    }
}


module.exports = new VariantsLoaderStore();
