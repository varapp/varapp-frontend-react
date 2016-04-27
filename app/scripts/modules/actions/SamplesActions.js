'use strict';
var dispatcher = require('../dispatcher/Dispatcher');
var SamplesConstants = require('../constants/SamplesConstants');
var ApiConstants = require('../constants/ApiConstants');
var RestService = require('../utils/RestService');


var samplesActions = {

    /* Async, fetches all samples */

    fetchSamples: function(db, samplesQuery) {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_FETCH_SAMPLES,
            state: ApiConstants.PENDING,
        });
        RestService.getSamples(db)
            .then(function(data) {
                dispatcher.dispatch({
                    actionType: SamplesConstants.ACTION_FETCH_SAMPLES,
                    state: ApiConstants.SUCCESS,
                    data: data,
                    params: samplesQuery,
                });
            })
            .fail(function(err) {
                dispatcher.dispatch({
                    actionType: SamplesConstants.ACTION_FETCH_SAMPLES,
                    state: ApiConstants.ERROR,
                    error: err,
                });
            });
    },

    /* Warn other components that the samples changed, after one of the actions below */

    samplesChanged: function(samples){
        //console.log("ACTION samplesChanged")
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_SAMPLES_CHANGED,
            samples: samples,
        });
    },

    /* Sync, acts on the samplesCollection of the store */

    updateSampleGroup: function(sample_name, group){
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_UPDATE_SAMPLE_GROUP,
            sample_name: sample_name,
            group: group
        });
    },
    updateSampleActive: function(sample_name) {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_UPDATE_SAMPLE_ACTIVE,
            sample_name: sample_name,
        });
    },
    updateFamilyActive: function(family_id) {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_UPDATE_FAMILY_ACTIVE,
            family_id: family_id,
        });
    },
    updateAllActive: function() {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_UPDATE_ALL_ACTIVE,
        });
    },
    filterGroup: function(group) {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_FILTER_AFFECTED,
            group: group,
        });
    },
    filterByPrefix: function(prefix) {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_FILTER_PREFIX,
            prefix: prefix,
        });
    },
    selectSample: function(sample) {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_SELECT_SAMPLE,
            sample: sample,
        });
    },
    selectionOnTop: function(moveToTop) {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_SELECTION_ON_TOP,
            moveToTop: moveToTop,
        });
    },
    clearSelection: function() {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_CLEAR_SELECTION,
        });
    },
    sortSamples: function(by, dir) {
        dispatcher.dispatch({
            actionType: SamplesConstants.ACTION_SORT_SAMPLES,
            by: by,
            dir: dir,
        });
    }
};
module.exports = samplesActions;
