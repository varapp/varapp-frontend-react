'use strict';
var dispatcher = require('../dispatcher/Dispatcher');
var FilterConstants = require('../constants/FilterConstants');
var ApiConstants = require('../constants/ApiConstants');
var RestService = require('../utils/RestService');

var FilterActions = {

    /* Async */

    fetchGlobalStats: function(db) {
        //console.log("ACTION fetchGlobalStats", field, value);
        dispatcher.dispatch({
            actionType: FilterConstants.ACTION_FETCH_GLOBAL_STATS,
            state: ApiConstants.PENDING,
        });
        return RestService.getGlobalStats(db)
            .then(function(data) {
                dispatcher.dispatch({
                    actionType: FilterConstants.ACTION_FETCH_GLOBAL_STATS,
                    state: ApiConstants.SUCCESS,
                    globalStats: data,
                });
            })
            .fail(function(err) {
                dispatcher.dispatch({
                    actionType: FilterConstants.ACTION_FETCH_GLOBAL_STATS,
                    state: ApiConstants.ERROR,
                    error: err,
                });
            });
    },

    /* Sync */

    updateOneFilterValue: function(field, value){
        //console.log("ACTION updateOneFilterValue", field, value);
        dispatcher.dispatch({
            actionType: FilterConstants.ACTION_UPDATE_ONE_FILTER_VALUE,
            field: field,
            value: value
        });
    },

    filtersReset: function(){
        //console.log("ACTION filtersReset");
        dispatcher.dispatch({
            actionType: FilterConstants.ACTION_FILTERS_RESET,
        });
    },

};
module.exports = FilterActions;
