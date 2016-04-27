'use strict';

var keyMirror = require('keymirror');
var _ = require('lodash');

var actions = keyMirror({
    ACTION_LOGIN_USER: null,
    ACTION_LOGOUT_USER: null,
    ACTION_SIGNUP_USER: null,
    ACTION_RENEW_SESSION: null,
    ACTION_UPDATE_USER: null,
    ACTION_ATTRIBUTE_DB: null,
    ACTION_CHANGE_ATTRIBUTE: null,
});

var status = {
    status: keyMirror({
        EXPIRED: null,
        NEW: null,
        LOGGED_OUT: null,
    })
};


module.exports = _.extend(actions, status);
