var React = require('react');
var ReactRouter = require('react-router');
var IndexLink = ReactRouter.IndexLink;
var RouterStore = require('../../stores/RouterStore');


/*
 * A Wrapper for ReactRouter.IndexLink that links to the main page but
 * also passes the samples/filters query as argument automatically.
 */

var LinkToVarappWrapper = function(OriginalLinkComponent) {
    return React.createClass({
        getInitialState: function() {
            var query = RouterStore.getQuery();
            return {query: query};
        },
        componentDidMount: function() {
            RouterStore.addChangeListener(this._onQueryChange);
        },
        componentWillUnmount: function() {
            RouterStore.removeChangeListener(this._onQueryChange);
        },
        _onQueryChange: function () {
            var query = RouterStore.getQuery();
            this.setState({query: query});
        },
        render: function() {
            return <OriginalLinkComponent className='link-to-varapp' to={{pathname:'/', query:this.state.query}} {...this.props}/>;
        }
    });
};

var LinkToVarapp = LinkToVarappWrapper(IndexLink);

module.exports = LinkToVarapp;
