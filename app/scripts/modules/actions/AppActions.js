'use strict';
var dispatcher = require('../dispatcher/Dispatcher');
var AppConstants = require('../constants/AppConstants');
var ApiConstants = require('../constants/ApiConstants');
var RestService = require('../utils/RestService');


var appActions = {
    changeDatabase: function(db) {
        //console.log("ACTION change database");
        dispatcher.dispatch({
            actionType: AppConstants.ACTION_CHANGE_DATABASE,
            db: db
        });
    },
    goToBookmark: function(query) {
        //console.log("ACTION go to bookmark");
        dispatcher.dispatch({
            actionType: AppConstants.ACTION_GOTO_BOOKMARK,
            query: query,
        });
    },
    changeUrl: function(query) {
        //console.log("ACTION change URL");
        dispatcher.dispatch({
            actionType: AppConstants.ACTION_CHANGE_URL,
            query: query,
        });
    },
    locationChanged: function() {
        //console.log("ACTION change location");
        dispatcher.dispatch({
            actionType: AppConstants.ACTION_CHANGE_LOCATION,
        });
    },

    initStatsCache: function() {
        //console.log("ACTION initStatsCache");
        dispatcher.dispatch({
            actionType: AppConstants.ACTION_INIT_STATS_CACHE,
            state: ApiConstants.PENDING,
        });
        (function poll(job){
            setTimeout(function(){
                RestService.pollStatsCache(job)
                    .then(function(data){
                        if (data.state === 'PENDING') {
                            //Setup the next poll recursively
                            poll(data.job);
                        } else if (data.state === 'SUCCESS') {
                            dispatcher.dispatch({
                                actionType: AppConstants.ACTION_INIT_STATS_CACHE,
                                state: ApiConstants.SUCCESS,
                                job: data.job,
                                job_state: data.state,
                            });
                        }
                    })
                    .fail(function(err) {
                        dispatcher.dispatch({
                            actionType: AppConstants.ACTION_INIT_STATS_CACHE,
                            state: ApiConstants.ERROR,
                            error: err,
                        });
                    });
           }, 2000);
        }());

    },
};


module.exports = appActions;
