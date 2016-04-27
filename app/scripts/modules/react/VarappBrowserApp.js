'use strict';
var React = window.React = require('react');

/* Main submodules */
var Filters = require('./filters/Filters');
var Variants = require('./variants/Variants.js');
var SamplesSummary = require('./samples/SamplesSummary');
var LookupPanel = require('./lookup/LookupPanel.js');
var LogPanel = require('./logging/LogPanel');

/**
 * VarappBrowserApp is mainly a container for these items:
 * - Login only, if not logged in
 * - Samples summary
 * - Filters
 * - Variants table
 * - Log panel
 * - Lookup panel, when visible
 **/


/* Route component */
var VarappBrowserApp = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },

    render: function () {
        var user = this.props.user;
        var db = this.props.db;
        if (user && !db) {
            return <p className='login-message'>{"No database available for user " + user.username}</p>;
        }
        return (
            <div id='varapp-browser-app' className="row">
                <div className="col-lg-12" id="samples-summary"><SamplesSummary /></div>
                <div className="col-lg-3">
                    <div id="lookup-panel"><LookupPanel /></div>
                    <div id="filters"><Filters /></div>
                    <div id="log-panel"><LogPanel /></div>
                </div>
                <div className="col-lg-9" id="variants"><Variants /></div>
            </div>
        );
    },
});


module.exports = VarappBrowserApp;
