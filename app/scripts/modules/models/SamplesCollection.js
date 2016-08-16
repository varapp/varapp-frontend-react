'use strict';
var _ = require('lodash');

/**
 * Samples come from the backend, and have the following properties:
 * - name
 * - group : 'affected'/'not_affected'
 * - family_id
 * - mother_id
 * - father_id
 * - bam : the key to the BAM file in bam-server
 * - active : whether it is used for filtering genotypes / checked in the interface
 * - visible : appears in the table (can be active or not), use for filtering
 **/

/**
 * @class SamplesCollection
 */
var SamplesCollection = function () {
    this._samples = [];
    this._groups = [{name: "not_affected", i:1},
                    {name: "affected", i:2}];
    return this;
};

/**
 * Getters
 **/
SamplesCollection.prototype.size = function() {
    return this._samples.length;
};
SamplesCollection.prototype.getSamples = function () {
    return this._samples;
};
SamplesCollection.prototype.getActiveSamples = function () {
    return _.filter(this._samples, 'active');
};
/* Return samples marked to be displayed with the visible=true property */
SamplesCollection.prototype.getVisibleSamples = function () {
    return _.filter(this._samples, 'visible');
};
/* Return the group names, e.g. ["affected","not_affected"] */
SamplesCollection.prototype.getGroups = function () {
    return this._groups;
};
/* Return the group names of active samples, e.g. ["affected","not_affected"] */
SamplesCollection.prototype.getActiveGroups = function () {
    return _.chain(this._samples)
        .filter('active')
        .pluck('group')
        .value();
};

/**
 * Setters
 **/
SamplesCollection.prototype.setSamples = function (data) {
    this._samples = data;
};


/*** Selections ***/


/* Get the i-th sample */
SamplesCollection.prototype.byIndex = function(idx) {
    return this._samples[idx];
};
/* Get the sample with this name */
SamplesCollection.prototype.byName = function(sample_name) {
    var idx = _.findIndex(this._samples, {name: sample_name});
    return this._samples[idx];
};
/* Get samples for a given family_id */
SamplesCollection.prototype.getFamilySamples = function(family_id) {
    return _.groupBy(this._samples, 'family_id')[family_id];
};
/* Get highlighted samples */
SamplesCollection.prototype.getSelectedSamples = function() {
    return _.filter(this._samples, 'selected');
};
///* Sort the samples collection (in-place) */
//SamplesCollection.prototype.sortBy = function (key, reverse) {
//    this._samples = _.sortBy(this._samples, key);
//    if (reverse) {
//        this._samples.reverse();
//    }
//    return this._samples;
//};


/*** URL construction ***/


/* Constructs the "query" list ['affected=A','not_affected=B,C'] to pass to the router */
SamplesCollection.prototype.buildGroupStrings = function () {
    var groups = _.groupBy(this._samples, 'group');
    var query = _.map(groups, function (samples) {
        var group_name = samples[0].group;
        /* List active sample names of this group */
        var s = _.chain(samples)
            .filter(function(x) {return x.active;})
            .map('name').join(',').value();
        return s === '' ? '' : group_name+"="+s;
    });
    /* If there is no active sample in a group, don't query for it */
    query = _.filter(query, function(x) {return x !== '';});
    return query;
};

/* Constructs the 'samples=...&samples=...' string to pass to Ajax queries */
SamplesCollection.prototype.buildUrlArgs = function () {
    var groups = _.groupBy(this._samples, 'group');
    var urlArgs = _.map(groups, function (samples) {
        var group_name = samples[0].group;
        /* List active sample names of this group */
        var s = _.chain(samples)
            .filter(function(x) {return x.active;})
            .map('name').join(',').value();
        return s === '' ? '' : "samples=" + group_name + "=" + s;
    });
    /* If there is no active sample in a group, don't query for it */
    urlArgs = _.filter(urlArgs, function(x) {return x !== '';});
    /* If there is no active sample left, just ask for /samples? */
    if (urlArgs.length === 0) {
        urlArgs = 'samples';
    } else {
        urlArgs = urlArgs.join('&');
    }
    return urlArgs;
};


/*** Active management ***/


/* Make the sample with this name active, or not */
SamplesCollection.prototype.setActive = function (sample_name, active) {
    var _this = this;
    var idx = _.findIndex(_this._samples, {name: sample_name});
    this._samples[idx].active = active;
    return _this;
};
/* If the sample with this name is active, deactivate, and conversely */
SamplesCollection.prototype.switchActive = function (sample_name) {
    var _this = this;
    var idx = _.findIndex(_this._samples, {name: sample_name});
    this._samples[idx].active = ! this._samples[idx].active;
    return _this;
};
/* Return a boolean: has this family at least one active sample ? */
SamplesCollection.prototype.familyActive = function (family_id) {
    var family_samples = _.groupBy(this._samples, 'family_id')[family_id];
    return _.some(family_samples, 'active');
};
/* Return a boolean: is there any active sample ? */
SamplesCollection.prototype.anyActive = function () {
    return _.some(this._samples, 'active');
};


/*** Summary ***/


/* Return a map {group -> count of samples in this group} (affected/not) */
SamplesCollection.prototype.summary = function () {
    var active = _.filter(this._samples, function(s){
        return s.active === true;
    });
    var counts = {'total': active.length};
    var countGroups = _.countBy(active, 'group');
    counts = _.merge(counts, countGroups);
    return counts;
};
/* Make affected/not affected groups visible or not */
SamplesCollection.prototype.toggleGroupVisibility = function (group) {
    _.forEach(this._samples, function (s) {
        s.visible = s.visible && (group === undefined || s.group === group);
    });
};
/* Search the prefix substring inside of sample names/family/parents names, and set visible if it is found. */
SamplesCollection.prototype.toggleVisibilityByPrefix = function (prefix) {
    var n = prefix.length;
    var match = function(name,pref) {return name.slice(0,n).toLowerCase() === pref.toLowerCase();};
    _.forEach(this._samples, function(s) {
        s.visible = s.visible && ( prefix === '' ||
                                  match(s.name, prefix) || match(s.family_id, prefix) ||
                                  match(s.mother_id, prefix) || match(s.father_id, prefix));
    });
};

module.exports = SamplesCollection;
