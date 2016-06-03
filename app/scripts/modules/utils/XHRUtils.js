'use strict';
var React = window.React = require('react');
var $ = require('jquery');
var _ = require('lodash');
var AuthenticatedComponent = require('../react/login/AuthenticatedComponent');
var backendUrl = window.CONFIG.BACKEND_URL;

console.debug("Backend URL:", backendUrl);

/**
 * Stuff that happens in the background everytime an XHR request is used.
 **/


/**
 *  DuplicateXHRKiller watches url and kill pending ones if another one is sent with the same root
 * @constructor
 */
var DuplicateXHRKiller = function () {
    var _this = this;
    _this.xhrPool = {};

    var categoryFromURL = function (url) {
        var category = url.replace(/\?.*/, '')  //remove arguments
            .replace(backendUrl, '')        // remove the domain
            .replace(/^\/\w*\//, '')            // remove the db name
            .replace(/^\//, '');                // remove the first slash
        return category;
    };

    var abort = function (category) {
        $.each(_this.xhrPool[category], function (idx, jqXHR) {
            jqXHR.abort();
        });
    };

    $(document).ajaxSend(function (e, jqXHR, options) {
        var category = categoryFromURL(options.url);
        if (_this.xhrPool[category] === undefined) {
            return;
        }

        abort(category);
        _this.xhrPool[category].push(jqXHR);
    }).ajaxComplete(function (e, jqXHR, options) {
        var category = categoryFromURL(options.url);

        if (_this.xhrPool[category] === undefined) {
            return;
        }

        _this.xhrPool[category] = $.grep(_this.xhrPool[category], function (x) {
            return x !== jqXHR;
        });
    });

};
/**
 * Add uri to watch for duplicate queries ('stats', 'variants'...)
 * The function can take multiple arguments
 */
DuplicateXHRKiller.prototype.addURI = function () {
    var _this = this;
    _.each(arguments, function (c) {
        if (_this.xhrPool[c] !== undefined) {
            return;
        }
        _this.xhrPool[c] = [];
    });
};


/**
 * @class IsLoadingReact
 * @description counts XHR start/stop and display an #isloading widget if something is in the pipe
 * @example
 * React.createElement(
 *     <IsLoadingReact/>
 * );
 */
var IsLoadingReact = React.createClass({
    getInitialState: function () {
        return {
            xhrCounter: 0
        };
    },

    componentDidMount: function () {
        var _this = this;
        $(document)
            .ajaxStart(function () {
                _this.setState({xhrCounter: _this.state.xhrCounter + 1});
            }).ajaxStop(function () {
                _this.setState({xhrCounter: Math.max(0, _this.state.xhrCounter - 1)});
            });
    },
    componentWillUnmount: function() {
        $(document).unbind('ajaxStart');
        $(document).unbind('ajaxStop');
    },

    render: function () {
        var _this = this;
        return (
            <div id="is-loading" style={{display: _this.state.xhrCounter?"block":"none", backgroundColor:'white'}}>
                <img src="images/loading-bar.gif"/>
            </div>
        );
    }
});


module.exports = {
    IsLoadingReact: AuthenticatedComponent(IsLoadingReact),
    duplicateXHRKiller: new DuplicateXHRKiller()
};

