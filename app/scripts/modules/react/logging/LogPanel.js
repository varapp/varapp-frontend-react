'use strict';
var React = require('react');
var _ = require('lodash');
var LogStore = require('../../stores/LogStore');
var ReactBoostrap = require('react-bootstrap');
var Panel = ReactBoostrap.Panel;
var AuthenticatedComponent = require('../login/AuthenticatedComponent');


var LogPanel = React.createClass({
    getInitialState: function () {
        return {
            db: LogStore.getDb(),
            content: LogStore.getContent(),
        };
    },
    componentDidMount: function () {
        LogStore.addChangeListener(this._onDataChange);
    },
    componentWillUnmount: function () {
        LogStore.eraseContent();
        LogStore.removeChangeListener(this._onDataChange);
    },

    _onDataChange: function () {
        this.setState({
            db: LogStore.getDb(),
            content: LogStore.getContent(),
        });
    },

    render: function () {
        var db = this.state.db;
        var content = [<li key='db'>{db ? "Using database '"+db+"'" : "No database selected"}</li>];
        content = content.concat(
            _.map(this.state.content, function(msg, i) {
                return <li key={i} className={msg.type}>{msg.time +' - '+ msg.text}</li>;
            })
        );

        return (
            <Panel>
                <ul>{content.reverse()}</ul>
            </Panel>
        );
    }
});

module.exports = AuthenticatedComponent(LogPanel);
