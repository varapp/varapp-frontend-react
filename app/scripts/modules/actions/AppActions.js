'use strict';
var dispatcher = require('../dispatcher/Dispatcher');
var AppConstants = require('../constants/AppConstants');


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
};


module.exports = appActions;
