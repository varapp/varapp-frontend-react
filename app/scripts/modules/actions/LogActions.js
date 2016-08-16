'use strict';
var dispatcher = require('../dispatcher/Dispatcher');
var LogConstants = require('../constants/LogConstants');

var logActions = {
    sendError: function(error){
        //console.log("ACTION sendError");
        dispatcher.dispatch({
            actionType: LogConstants.ACTION_SEND_ERROR,
            error: error,
        });
    },
    sendSuccess: function(msg) {
        dispatcher.dispatch({
            actionType: LogConstants.ACTION_SEND_SUCCESS,
            msg: msg,
        });
    },
    sendWarning: function(msg) {
        dispatcher.dispatch({
            actionType: LogConstants.ACTION_SEND_WARNING,
            msg: msg,
        });
    },
};
module.exports = logActions;
