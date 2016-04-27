'use strict';
var LogActions = require('../actions/LogActions');
var UtilsConstants = require('../constants/UtilsConstants');
var env = require('../environment');
var $ = require('jquery');
var toastr = require('toastr');

toastr.options = UtilsConstants.TOASTR_OPTIONS;
toastr.options.timeOut = 12000;


/**
 * Issue REST call to the backend.
 * The module exports a singleton.
 * @constructor
 */
var RestClientService = function(){
    return this;
};

/* Send error for display in LoagPanel and toastr */
RestClientService.prototype.sendError = function(err, msg) {
    LogActions.sendError('('+err.status+') '+msg);
    toastr.error(msg);
};

RestClientService.prototype.reportError = function(err, uri) {
    var msg = "";
    var json = err.responseJSON;
    console.log("RestClientService error ::",err);
    if (err.status === 404) {
        msg = msg + "Page not found.";
        this.sendError(err, msg);
    } else if (err.status === 403) {  // Authentication error
        if (err.responseText === "Signature has expired") {
            // Let LoginStore handle token expiration - it will signal to App.js to redirect to /login
        } else if (err.responseText === "Wrong password") {
            // Let Login.js display the error
        } else {
            this.sendError(err, err.responseText);
        }
    } else if (err.status === 502) {  // Proxy error
        msg = msg + "The request probably timed out because the data processing " +
            "took too much time. Please try to wait a minute and then reload the page.";
        this.sendError(err, msg);
    } else if (err.status === 0) {
        if (err.statusText === 'abort') {  // Request cancelled
        } else {
            msg = "The server is currently down. Please try again later or contact an administrator.";
            this.sendError(err, msg);
        }
    } else if (err.status === 550) {  // SMTP error
        msg = "Could not reach this email address.";
        this.sendError(err, msg);
    } else if (err.status === 500 && json && json.message.search('SMTP') >= 0) {  // No SMTP server
        msg = "Email could not be sent (SMTP server is offline). Please contact an administrator.";
        this.sendError(err, msg);
    } else if (err.status === 500 && json && json.message === 'Users matching query does not exist.') {
        msg = json.message;
        this.sendError(err, msg);
    } else {
        err.uri = env.backendUrl+uri;
        LogActions.sendError('Error returned from GET '+ env.backendUrl+uri);
        msg = msg + err.status+' '+err.statusText+' - '+err.responseText;
        this.sendError(err, msg);
    }
};

/**
 * Make a get call to the backend url + uri and returns a promise.
 * @param uri
 * @returns {*}
 */
RestClientService.prototype.get = function(uri){
    //console.log("RestClientService :: URI: ", uri)
    var _this = this;
    var jwt = localStorage.getItem('jwt');
    var auth = jwt ? 'JWT '+jwt : 'null';
    //console.log('RestClientService :: jwt ::', !!jwt)
    return $.ajax({
        url: env.backendUrl + uri,
        type: 'GET',
        headers: {'Authorization': auth},
        error: function(err) {
                _this.reportError(err, uri);
                return err;
            },
        //success: function(response) {
        //        return response;
        //    },
    });
};

RestClientService.prototype.post = function(uri, data){
    //console.log("RestClientService :: URI: ", uri)
    //console.log("RestClientService :: POST data: ", data)
    var _this = this;
    var jwt = localStorage.getItem('jwt');
    var auth = jwt ? 'JWT '+jwt : 'null';
    //console.log('RestClientService :: jwt ::', !!jwt)
    return $.ajax({
        url: env.backendUrl + uri,
        type: 'POST',
        headers: {'Authorization': auth},
        data: data,
        error: function(err) {
                _this.reportError(err, uri);
                return err;
            },
        //success: function(response) {
        //        return response;
        //    },
    });
};


module.exports = new RestClientService();
