'use strict';
var env = require('../environment');
var RestClient = require('./RestClientService');
var RestService = function() {};

/*********************/
/****  Variants  *** */
/*********************/

RestService.prototype.getVariants = function(db, nrows, variantUrlArgs) {
    var variantsUrl = '/'+db+'/variants?' + 'limit='+nrows + '&'+variantUrlArgs;
    return RestClient.get(variantsUrl);
};
RestService.prototype.getNextVariants = function(db, nrows, offset, variantUrlArgs) {
    var variantsUrl = '/'+db+'/variants?' + 'limit='+nrows + '&offset='+offset + '&'+variantUrlArgs;
    return RestClient.get(variantsUrl);
};

/*********************/
/****  Bookmarks  ****/
/*********************/

RestService.prototype.getBookmarks = function(db) {
    return RestClient.get('/'+db+'/getBookmarks');
};
RestService.prototype.setBookmark = function(db, url, time, bookmark, text) {
    return RestClient.post('/'+db+'/setBookmark', {url, time, bookmark, text});
};
RestService.prototype.deleteBookmark = function(db, time) {
    return RestClient.post('/'+db+'/deleteBookmark', {db, time});
};

/*********************/
/*****  Samples  *****/
/*********************/

RestService.prototype.getSamples = function(db) {
    var samplesUrl = '/'+db+'/samples';
    return RestClient.get(samplesUrl);
};

/*********************/
/*****  Filters  *****/
/*********************/

RestService.prototype.getGlobalStats = function(db) {
    var globalStatsUrl = '/'+db+'/stats';
    return RestClient.get(globalStatsUrl);
};

/*********************/
/*****  Lookup  ******/
/*********************/

RestService.prototype.updateVariant = function(db, variantUrlArgs, variant_id) {
    var selectedVariantUrl = '/'+db+'/variants?' + variantUrlArgs + '&filter=variant_id='+variant_id;
    return RestClient.get(selectedVariantUrl);
};

/*********************/
/******  Auth  *******/
/*********************/

RestService.prototype.login = function(username, password) {
    return RestClient.post('/authenticate', {username, password});
};
RestService.prototype.signup = function (username, password, firstname, lastname, email, phone) {
    return RestClient.post('/signup', {username, password, firstname, lastname, email, phone});
};
RestService.prototype.resetPasswordRequest = function(username, email) {
    var host = env.frontendUrl;
    return RestClient.post('/resetPasswordRequest', {username, email, host});
};
RestService.prototype.resetPasswordConfirm = function(username, email, activation_code) {
    return RestClient.post('/changePassword', {username, email, activation_code});
};
RestService.prototype.renew_session = function() {
    return RestClient.post('/renew_token');
};
RestService.prototype.deleteUser = function(username, code) {
    return RestClient.post('/deleteUser', {username, code});
};
RestService.prototype.userActivation = function(username, code, email, activate) {
    return RestClient.post('/userActivation', {username, code, email, activate});
};
RestService.prototype.attributeDb = function(username, code, dbname, add) {
    return RestClient.post('/attributeDb', {username, code, dbname, add});
};
RestService.prototype.changeAttribute = function(username, code, attribute, new_value) {
    return RestClient.post('/changeAttribute', {username, code, attribute, new_value});
};

/*********************/
/*****  Export  ******/
/*********************/

/* Triggering a download with Ajax is not easy !
   Source: http://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post/23797348#23797348 */
RestService.prototype.export = function(db, format, fields, variantUrlArgs) {
    var exportUrl = '/'+db+'/variants/export?' + 'format='+format + '&fields='+fields.join(',') + '&'+variantUrlArgs;
    return RestClient.get(exportUrl)
        .fail(function(err) {
            console.error('Export failed', err);
        })
        .then(function(response, status, xhr) {
            /* Check for a filename */
            var filename = "";
            var disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches !== null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            var type = xhr.getResponseHeader('Content-Type');
            var blob = new Blob([response], { type: type });
            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                /* IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created.
                   These URLs will no longer resolve as the data backing the URL has been freed." */
                window.navigator.msSaveBlob(blob, filename);
            } else {
                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);
                if (filename) {
                    /* Use HTML5 a[download] attribute to specify filename */
                    var a = document.createElement("a");
                    /* Fallback: Safari doesn't support this yet */
                    if (typeof a.download === 'undefined') {
                        window.location = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                    }
                /* Fallback */
                } else {
                    window.location = downloadUrl;
                }
                setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
            }
        });
};


module.exports = new RestService();
