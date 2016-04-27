
var AppStore = require('../stores/AppStore');
var SamplesStore = require('../stores/SamplesStore');
var FilterStore = require('../stores/FilterStore');
var VariantStore = require('../stores/VariantStore');


/*
 * Reads the different stores to build URLs / Router query dict
 */


var Api = function() {};

Api.prototype.getDb = function() {
    return AppStore.getDb();
};
Api.prototype.storesReady = function() {
    return AppStore.getDb() && SamplesStore.isReady() && FilterStore.isReady();
};
Api.prototype.samplesUrlArgs = function() {
    return SamplesStore.getSamplesCollection().buildUrlArgs();
};
Api.prototype.filterUrlArgs = function() {
    return FilterStore.getFilterCollection().buildUrlArgs();
};
Api.prototype.sortUrlArgs = function() {
    var sortBy = VariantStore.sortBy;
    var sortDirection = VariantStore.sortDirection;
    if (sortBy && sortDirection) {
        return 'order_by='+sortBy+','+sortDirection;
    } else {
        return '';
    }
};
Api.prototype.variantUrlArgs = function() {
    var args = this.filterUrlArgs() + '&' + this.samplesUrlArgs();
    var sortArgs = this.sortUrlArgs();
    if (sortArgs && (sortArgs !== '')) {
        args = args + '&' + sortArgs;
    }
    return args;
};

/* Router */

Api.prototype.buildQueryDict = function() {
    if (this.storesReady()) {
        var query = {
            db: AppStore.getDb(),
            samples: SamplesStore.getSamplesCollection().buildGroupStrings(),
            filter: FilterStore.getFilterCollection().buildGroupStrings(),
            order_by: VariantStore.buildSortGroupStrings(),
            columns: VariantStore.buildColumnsGroupStrings(),
        };
        return query;
    }
};


module.exports = new Api();
