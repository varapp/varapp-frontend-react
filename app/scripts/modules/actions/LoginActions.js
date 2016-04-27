'use strict';
var dispatcher = require('../dispatcher/Dispatcher');
var LoginConstants = require('../constants/LoginConstants');
var ApiConstants = require('../constants/ApiConstants');
var RestService = require('../utils/RestService');


/**
 * All actions requiring authentication need a call to backend to verify the JWT
 * @param actionType: a LoginConstant, the name of the LoginAction
 * @param promise: a call to RestService
 * Returns a promise, i.e. one can chain a .then after that.
 **/
var asyncLoginAction = function(actionType, promise) {
    dispatcher.dispatch({
        actionType: actionType,
        state: ApiConstants.PENDING,
    });
    return promise
        .then(function(response) {
            var jwt = response.id_token;
            dispatcher.dispatch({
                actionType: actionType,
                state: ApiConstants.SUCCESS,
                jwt: jwt,
            });
            return response;
        }).fail(function(err) {
            dispatcher.dispatch({
                actionType: actionType,
                state: ApiConstants.ERROR,
            });
            return err;
        });
};


var loginActions = {

    logoutUser: function() {
        dispatcher.dispatch({
            actionType: LoginConstants.ACTION_LOGOUT_USER,
        });
    },

    // Send the username and password to log in, only the first time
    loginUser: function(username, password) {
        return asyncLoginAction(
            LoginConstants.ACTION_LOGIN_USER,
            RestService.login(username, password)
        );
    },
    signupUser: function(username, password, firstname, lastname, email, phone) {
        return asyncLoginAction(
            LoginConstants.ACTION_SIGNUP_USER,
            RestService.signup(username, password, firstname, lastname, email, phone)
        );
    },
    attributeDb: function(username, code, dbname, add) {
        return asyncLoginAction(
            LoginConstants.ACTION_ATTRIBUTE_DB,
            RestService.attributeDb(username, code, dbname, add)
        );
    },
    changeAttribute: function(username, code, attribute, new_value) {
        return asyncLoginAction(
            LoginConstants.ACTION_CHANGE_ATTRIBUTE,
            RestService.changeAttribute(username, code, attribute, new_value)
        );
    },
    // Ask for a new token expiration time, using the JWT in the Authorization header
    renewSession: function() {
        return asyncLoginAction(
            LoginConstants.ACTION_RENEW_SESSION,
            RestService.renew_session()
        );
    },
    // Ask for a new token, which contains updater user data.
    // Same as the above, but we need to react differently to this action
    updateUser: function() {
        return asyncLoginAction(
            LoginConstants.ACTION_UPDATE_USER,
            RestService.renew_session()
        );
    },

    /**
     * These do not concern the current user, - one cannot deactivate/delete oneself,
     * so no need to update the LoginStore.
     **/

    activateUser: function(username, code, email, activate) {
        return RestService.userActivation(username, code, email, activate);
    },
    deleteUser: function(username, code) {
        return RestService.deleteUser(username, code);
    },

};


module.exports = loginActions;
