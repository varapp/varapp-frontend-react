'use strict';
var _ = require('lodash');

var DEFAULT_GROUP_NAME = 'default';
function FilterCollectionError(msg) {
    this.message = msg;
}

/**
 * @class FilterCollection
 * @description applied filter collection
 *
 *  Build the list of filters, organize them into groups, ensure there are no duplicate etc etc.
 */
var FilterCollection = function () {
    this._filters = {};
    this._groups = {};   // Some filters are grouped, some may not be (e.g. location)
    this._counts = {};   // Stats, how many of each category remain in the present dataset
    this._globalStats = {};
    return this;
};


/* Constructs the "query" list ['quality<=1','in_dnsnp=true',...] to pass to the router */
FilterCollection.prototype.buildGroupStrings = function () {
    var _this = this;
    var params = _.chain(_this._filters)
        .filter(function (f) {
            return (f.value !== undefined) && (f.value !== f.nullValue);
        })
        .map(function (f) {
            var value = f.value;
            var op = f.op || '=';
            value = [value].join(',');  // identity for strings, but joins arrays
            return f.field + op + value;
        }).value();
    return params;
};

/* Constructs the 'samples=...&samples=...' string to pass to GET queries */
FilterCollection.prototype.buildUrlArgs = function () {
    var _this = this;
    var params = _.chain(_this._filters)
        .filter(function (f) {
            return (f.value !== undefined) && (f.value !== f.nullValue);
        })
        .map(function (f) {
            var value = f.value;
            var op = f.op || '=';
            value = [value].join(',');  // identity for strings, but joins arrays
            return 'filter=' + f.field + op + value;
        })
        .value().join('&');
    return params;
};


/** @memberOf FilterCollection.prototype
 * @description Add a filter to the full list
 * @param {Object} filter data structure, field should be unique wirhin one collection
 * @returns {Filters} this
 **/
FilterCollection.prototype.add = function (thatFilter) {
    var _this = this;
    var filter = _.extend({
        group: DEFAULT_GROUP_NAME
    }, thatFilter);
    filter.index = _.size(_this._filters);
    if (_this._filters[filter.field] !== undefined) {
        throw new FilterCollectionError('duplicate filter with field [' + filter.field + ']');
    }
    _this._filters[filter.field] = filter;
    //if (_this.group(filter.group) === undefined) {
    //    _this.addGroup(filter.group);
    //}
    return _this;
};

/** @memberOf FilterCollection.prototype
 * @description get a filter by name
 * @param {String} filterName the filter name
 * @returns {*} the pointed value
 **/
FilterCollection.prototype.get = function (filterName) {
    return this._filters[filterName];
};

/** @memberOf FilterCollection.prototype
 * @description set a property for a given filter
 * @param {String} filterName the filter name
 * @param {String} field the field name
 * @param {*) value the new value to be set
 * @returns {Object} filter
 **/
FilterCollection.prototype.setProperty = function (filterName, field, value) {
    var _this = this;
    _this._filters[filterName][field] = value;
    return _this;
};


/** @memberOf FilterCollection.prototype
 * @description get a property for a given filter
 * @param {String} filterName the filter name
 * @param {String} field the field name
 * @returns {*} the prerty value
 **/
FilterCollection.prototype.getProperty = function (filterName, field) {
    var _this = this;
    return _this._filters[filterName][field];
};



/** @memberOf FilterCollection.prototype
 * @description set a value
 * @param {String} filterName the filter name
 * @param {*} value the value to be set
 * @returns {Object} this
 **/
FilterCollection.prototype.setValue = function (filterName, value) {
    var _this = this;
    _this._filters[filterName].value = value;
    return _this;
};

/** @memberOf FilterCollection.prototype
 * @description get a filter value. a currying of getProperty(filterName, 'value');
 * @param {String} filterName the filter name
 * @returns {*} the filter value
 **/
FilterCollection.prototype.getValue = function (filterName) {
    return this._filters[filterName].value;
};

FilterCollection.prototype.setGlobalStats = function (stats) {
    var _this = this;
    _this._globalStats = stats;
    return _this;
};

/** @memberOf FilterCollection.prototype
 * @description set a counter value
 * @param {String} counterName the count field (of 'filtered', 'total'...)
 * @param {Number} value the value to be set
 * @returns {Object} this
 **/
FilterCollection.prototype.setCount = function (counterName, value) {
    var _this = this;
    _this._counts[counterName] = value;
    return _this;
};

/** @memberOf FilterCollection.prototype
 * @description get a counter value
 * @param {String} counterName the filter name
 * @returns {Number} the counter value
 **/
FilterCollection.prototype.getCount = function (counterName) {
    return this._counts[counterName];
};

/** @memberOf FilterCollection.prototype
 * @description get a counter value
 * @returns {Object}
 **/
FilterCollection.prototype.getCounts = function () {
    return this._counts;
};

/** @memberOf FilterCollection.prototype
 * @description get the number of filters
 * @returns {Number}
 **/
FilterCollection.prototype.size = function () {
    return _.size(this._filters);
};

/** @memberOf FilterCollection.prototype
 * @description add a group of filter, that will appear in the given order. An index argument is added to each group, to keep sorting
 * @param {String} groupName group name shall be unique.
 * @returns {Filters} this
 **/
FilterCollection.prototype.addGroup = function (groupName) {
    var _this = this;
    if (this._groups[groupName] !== undefined) {
        throw new FilterCollectionError('group [' + groupName + '] is duplicate');
    }
    this._groups[groupName] = {name: groupName, index: _.size(_this._groups)};
    return _this;
};


/** @memberOf FilterCollection.prototype
 * @description get the map of all group,
 * @returns {Object} a map of name -> groups
 **/
FilterCollection.prototype.groups = function () {
    return this._groups;
};

/** @memberOf FilterCollection.prototype
 * @description get a group by name. eventually create one if does not yet exist
 * @param {String} name the groupe name.
 * @returns {Object} a group Filter
 **/
FilterCollection.prototype.group = function (name) {
    var _this = this;
    if (_this._groups[name] === undefined) {
        _this.addGroup(name);
    }
    return _this._groups[name];
};

/** @memberOf FilterCollection.prototype
 * @description return an array of filters, grouped by group. Filters & groups are sorted by index
 * @returns {Array} a group Filter
 **/
FilterCollection.prototype.byGroup = function () {
    var _this = this;
    return _.chain(_this._filters)
        .groupBy('group')
        .map(function (filters, groupName) {
            return {
                name: groupName,
                filters: filters
            };
        })
        .filter(function (x) {
            return (x.name in _this._groups);
        })
        .sortBy(function(x){
            return _this._groups[x.name].index;
        })
        .value();
};


module.exports = FilterCollection;
