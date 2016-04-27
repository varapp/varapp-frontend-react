'use strict';
var dispatcher = require('../dispatcher/Dispatcher');
var AdminConstants = require('../constants/AdminConstants');
var ApiConstants = require('../constants/ApiConstants');
var RestClient = require('../utils/RestClientService');
var when = require('when');


var AdminActions = {
    fetchUsersInfo: function() {
        //console.log("ACTION fetchUsersInfo");
        dispatcher.dispatch({
            actionType: AdminConstants.ACTION_FETCH_USERS_INFO,
            state: ApiConstants.PENDING,
        });
        var usersData = {};
        when.join(
            RestClient.get('/dbsInfo').then(function (data) {
                usersData.databases = data;
            }),
            RestClient.get('/usersInfo').then(function (data) {
                usersData.users = data;
            }),
            RestClient.get('/rolesInfo').then(function (data) {
                usersData.roles = data;
            })
        ).then(function() {
            dispatcher.dispatch({
                actionType: AdminConstants.ACTION_FETCH_USERS_INFO,
                state: ApiConstants.SUCCESS,
                data: usersData,
            });
        }).catch(function() {
            dispatcher.dispatch({
                actionType: AdminConstants.ACTION_FETCH_USERS_INFO,
                state: ApiConstants.ERROR,
            });
        });
    },

};


module.exports = AdminActions;
