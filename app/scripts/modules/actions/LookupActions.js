'use strict';
var dispatcher = require('../dispatcher/Dispatcher');
var LookupConstants = require('../constants/LookupConstants');
var ApiConstants = require('../constants/ApiConstants');
var RestService = require('../utils/RestService');


var appActions = {
    updateLookupVariant: function(db, urlArgs, variant_id) {
        dispatcher.dispatch({
            actionType: LookupConstants.ACTION_UPDATE_LOOKUP_VARIANT,
            state: ApiConstants.PENDING,
        });
        return RestService.updateVariant(db, urlArgs, variant_id)
            .then(function(data) {
                dispatcher.dispatch({
                    actionType: LookupConstants.ACTION_UPDATE_LOOKUP_VARIANT,
                    state: ApiConstants.SUCCESS,
                    data: data,
                });
            });
    },
};


module.exports = appActions;
