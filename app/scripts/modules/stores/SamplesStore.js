'use strict';

var BaseStore = require('./BaseStore');
var _ = require('lodash');
var toastr = require('toastr');
var SamplesCollection = require('../models/SamplesCollection');

/* Constants */
var SamplesConstants = require('../constants/SamplesConstants');
var UtilsConstants = require('../constants/UtilsConstants');
var ApiConstants = require('../constants/ApiConstants');
var VariantConstants = require('../constants/VariantConstants');
var DESC = UtilsConstants.DESC;


class SamplesStore extends BaseStore {
    constructor() {
        this.init(null);
        this._isReady = false;
        this._samplesCollection = new SamplesCollection();
        this.subscribe(() => this._registerToActions.bind(this));
    }

    init(db) {
        this._db = db;
        this._samplesChanged = false;
        this._variantStats = null;
        this.sortDirection = DESC;
        this.sortBy = ['family_id', 'name'];
        this._prefixFilter = '';
        this._groupFilter = undefined;
        this.scrollPosition = 0;   // super dirty
    }
    reset(db) {
        this.init(db);
        this.emitChange();
    }

    /* Getters */
    getSamplesCollection() { return this._samplesCollection; }
    getVariantStats() { return this._variantStats; }
    samplesChanged() { return this._samplesChanged; }
    isReady() { return this._isReady; }
    size() { return this._samplesCollection.getActiveSamples().length; }

    /* Setters */
    setSamplesChanged(v) { this._samplesChanged = v; }

    /* Take the 'samples' query as returned by the router: ['affected=A,B', 'not_affected=C,D,E', ...],
       and return an object {affected: [A,B], not_affected: [C,D,E]} */
    parseQueryString(params) {
        var parsed = {};
        _.forEach(params, function(par) {
            var param = par.split('=');
            /* If '?samples=' or '?samples' an nothing after it, does not count */
            if (param.length === 2) {
                var group = param[0];
                var list = param[1].split(',');
                parsed[group] = list;
            }
        });
        return parsed;
    }

    /* Make sure that arguments passed by URL or localStorage are valid,
       otherwise warn and ignore them.
       @samplesMap: as parsed above from url query. */
    validateSamples(samplesMap) {
        var validSampleNames = _.map(this._samplesCollection.getSamples(), 'name');
        var invalid = [];
        _.forEach(samplesMap, function(list, group) {
            _.forEach(list, function(sampleName) {
                if (validSampleNames.indexOf(sampleName) < 0) {
                    invalid.push([group,sampleName]);
                }
            });
        });
        _.forEach(invalid, function(v) {
            _.pull(samplesMap[v[0]], v[1]);
        });
        if (invalid.length > 0) {
            var invalids = _.unzip(invalid)[1].join(', ');
            toastr.warning('Ignored invalid sample names: '+ invalids);
        }
        return samplesMap;
    }

    /**
     * Set the data properties, especially the grouping affected/not.
     * We always $get the full samples collection, then determine which are to be active or not.
     **/
    updateSamples(params) {
        var samples = this._samplesCollection.getSamples();
        /* If sample groups are passed through URL, use them to say they are active. */
        if (params && params.length > 0) {
            var actives = [];
            var groupOf = {};
            var parsed = this.parseQueryString(params);
            parsed = this.validateSamples(parsed);
            /* Make the list of active samples, and map their group in case it differs from the database's */
            _.forEach(parsed, function(list, key) {
                actives = actives.concat(list);
                _.forEach(list, function (s) {
                    groupOf[s] = key;
                });
            });
            /* Fill sample objects with the data gathered above */
            _.forEach(samples, function(s) {
                s.active = (actives.indexOf(s.name) >= 0) ? true : false;
                if (s.name in groupOf) {
                    s.group = groupOf[s.name];
                }
            });
        }
        /* Otherwise, activate the first family only, by default. */
        else {
            var firstFamily = _.sortBy(samples,'family_id')[0].family_id;
            _.forEach(samples, function(s) {
                s.active = (s.family_id === firstFamily) ? true : false;
            });
        }
        /* Make them all visible in the table, while not filtered */
        _.forEach(samples, function(s) {
            s.visible = true;
        });

        this._samplesCollection.setSamples(samples);
        this._isReady = true;
        this.emitChange();
    }


    /**
     * Events triggering a new async variants query
     **/


    /* What happens when a user switches affected/not */
    updateSampleGroup(sample_name, group) {
        var idx = _.findIndex(this._samplesCollection.getSamples(), {name: sample_name});
        var sample = this._samplesCollection.byIndex(idx);
        sample.group = group.name;
        if (! sample.active) {
            sample.active = true;
        }
        this.emitChange();
    }

    /* What happens when a user activates/deactivates a sample */
    updateSampleActive(sample_name) {
        this._samplesCollection.switchActive(sample_name);
        this.emitChange();
    }

    /* Make all the family active/inactive */
    updateFamilyActive(family_id) {
        var _this = this;
        var familySamples = this._samplesCollection.getFamilySamples(family_id);
        var isActive = this._samplesCollection.familyActive(family_id);
        _.forEach(familySamples, function(sample) {
            _this._samplesCollection.setActive(sample.name, ! isActive);
        });
        this.emitChange();
    }

    /* If any sample is still active, deactivate all. If all are inactive, activate all.*/
    updateAllActive() {
        var isActive = this._samplesCollection.anyActive();
        _.map(this._samplesCollection.getSamples(), function(s) {
            s.active = ! isActive;
        });
        this.emitChange();
    }


    /**
     * Events changing the state of the stored samples, without Ajax query
     **/

    /* If this sample was already selected, deselect it. If it was not, select it. Leave others unchanged. */
    updateSelection(sample) {
        _.forEach(this._samplesCollection.getSamples(), function(s){
            s.selected = s.name === sample.name ? !s.selected : s.selected;
        });
    }

    /* Clear highlighted samples set */
    clearSelection() {
        _.forEach(this._samplesCollection.getSamples(), function(s){
            s.selected = false;
        });
    }

    /* Sets the visible property of each sample, based on filters below */
    filter(){
        _.forEach(this._samplesCollection.getSamples(), function(s) {s.visible = true;});
        this.filterGroup(this._groupFilter);
        this.filterByPrefix(this._prefixFilter);
    }

    /* Show only affected/not_affected samples */
    filterGroup(group){
        this._samplesCollection.toggleGroupVisibility(group);
    }

    /* Show only samples with that prefix in one of their text fields */
    filterByPrefix(prefix) {
        this._samplesCollection.toggleVisibilityByPrefix(prefix);
    }

    _registerToActions(payload) {
        switch (payload.actionType) {

            case SamplesConstants.ACTION_FETCH_SAMPLES:
                if (payload.state === ApiConstants.PENDING) {
                    //console.log("SamplesStore :: ACTION_FETCH_SAMPLES (PENDING)");
                    this._samplesCollection = new SamplesCollection();
                    this._isReady = false;
                    this._samplesChanged = false;
                    this.emitChange();
                }
                else if (payload.state === ApiConstants.SUCCESS) {
                    console.log("SamplesStore :: ACTION_FETCH_SAMPLES");
                    this._isReady = true;
                    this._samplesCollection.setSamples(payload.data);
                    this.updateSamples(payload.params);
                    this._samplesChanged = true;
                    this.emitChange();
                }
                //else if (payload.state === ApiConstants.ERROR) {
                //    console.log("SamplesStore :: ACTION_FETCH_SAMPLES <<ERROR>>");
                //    this._isReady = false;
                //    this.emitChange();
                //}
                break;

            /* When variants are queried, signal that it is done - to not query variants again */

            case VariantConstants.ACTION_FETCH_VARIANTS:
                if (payload.state === ApiConstants.SUCCESS) {
                    console.log("SamplesStore :: ACTION_FETCH_VARIANTS (feedback)");
                    this._samplesChanged = false;
                    this.emitChange();
                }
                break;

            /* These actions trigger a variants query */

            case SamplesConstants.ACTION_UPDATE_SAMPLE_GROUP:
                console.log("SamplesStore :: ACTION_UPDATE_SAMPLE_GROUP");
                this.updateSampleGroup(payload.sample_name, payload.group);
                this._samplesChanged = true;
                break;

            case SamplesConstants.ACTION_UPDATE_SAMPLE_ACTIVE:
                console.log("SamplesStore :: ACTION_UPDATE_SAMPLE_ACTIVE");
                this.updateSampleActive(payload.sample_name);
                this._samplesChanged = true;
                break;

            case SamplesConstants.ACTION_UPDATE_FAMILY_ACTIVE:
                console.log("SamplesStore :: ACTION_UPDATE_FAMILY_ACTIVE");
                this.updateFamilyActive(payload.family_id);
                this._samplesChanged = true;
                break;

            case SamplesConstants.ACTION_UPDATE_ALL_ACTIVE:
                console.log("SamplesStore :: ACTION_UPDATE_ALL_ACTIVE");
                this._samplesChanged = true;
                this.updateAllActive();
                break;

            /* These actions only act on the table content - no variants query */

            case SamplesConstants.ACTION_SELECT_SAMPLE:
                console.log("SamplesStore :: ACTION_SELECT_SAMPLE");
                this.updateSelection(payload.sample);
                this.emitChange();
                break;

            case SamplesConstants.ACTION_SELECTION_ON_TOP:
                console.log("SamplesStore :: ACTION_SELECTION_ON_TOP");
                var selected = this._samplesCollection.getSelectedSamples();
                if (selected.length > 0) {
                    this.sortBy = payload.moveToTop ? ['selected', this.sortBy[0]] : [this.sortBy[1], 'name'];
                    this.sortDirection = DESC;
                    this.emitChange();
                }
                break;

            case SamplesConstants.ACTION_CLEAR_SELECTION:
                console.log("SamplesStore :: ACTION_CLEAR_SELECTION");
                this.clearSelection();
                this.sortBy = this.sortBy[0] === 'selected' ? [this.sortBy[1], 'name'] : this.sortBy;
                this.emitChange();
                break;

            case SamplesConstants.ACTION_SORT_SAMPLES:
                console.log("SamplesStore :: ACTION_SORT_SAMPLES");
                this.sortBy = [payload.by, 'family_id', 'name'];
                this.sortDirection = payload.dir;
                this.emitChange();
                break;

            case SamplesConstants.ACTION_FILTER_AFFECTED:
                console.log("SamplesStore :: ACTION_FILTER_AFFECTED");
                if (payload.group !== this._groupFilter) {
                    this._groupFilter = payload.group;
                    this.filter();
                    this.emitChange();
                }
                break;

            case SamplesConstants.ACTION_FILTER_PREFIX:
                console.log("SamplesStore :: ACTION_FILTER_PREFIX");
                if (payload.prefix !== this._prefixFilter) {
                    this._prefixFilter = payload.prefix;
                    this.filter();
                    this.emitChange();
                }
                break;

            default:
                return true;
        }
        return true;
    }

}


module.exports = new SamplesStore();

