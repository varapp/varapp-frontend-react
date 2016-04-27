'use strict';
var React = require('react');

/* Actions */
var FilterActions = require('../../actions/FilterActions');

/* Constants */
var FilterConstants = require('../../constants/FilterConstants');

/* Utils */
var _ = require('lodash');
var formatters = require ('../../utils/formatters');

/* React-bootstrap */
var ReactBootstrap = require('react-bootstrap');
var Glyphicon = ReactBootstrap.Glyphicon;

var OP_SYMBOLS = {
    '>=': '≥',
    '<=': '≤'
};


/**
 * The summary of the chosen filters that appears in the panel footer even when
 * the corresponding filter tab is closed.
 **/
var FilterSummary = React.createClass({
    removeFromSummary: function(field) {
        FilterActions.updateOneFilterValue(field, undefined);
    },

    fctFilterSummary: function (filters) {
        return _.chain(filters)
            .filter(function (f) {
                return f.value !== undefined &&
                       f.value !== f.nullValue &&
                       f.value !== f.invisibleValue;
            })
            .map(function (f) {
                var value = f.value;
                var op = f.op;
                var prefix = '';
            /* Enums */
                if (f.type === FilterConstants.FILTER_TYPE_ENUM) {
                    value = value.replace(/_/g, ' ');
                    value = value.split(',');
                }
                if (_.isArray(value)) {
                    if (value.length>1) {
                        op = '∈';
                        value = '(' + value.join(', ') + ')';
                    } else {
                        op='=';
                        value = value[0];
                    }
            /* TrueFalseAny */
                } else if (_.isBoolean(value)) {
                    if (value === false) {
                        prefix = 'not ';
                    }
                    op = '';
                    value = '';
            /* Numeric */
                } else if (!isNaN(parseFloat(value))) {
                    if (f.type === FilterConstants.FILTER_TYPE_FREQUENCY){
                        value = formatters.formatFrequencyPercent(value);
                    } else if (value % 1 !== 0) {
                        value = formatters.roundSignif(value, 3);
                    }
            /* All others */
                } else if (op === undefined) {
                    op = ':';
                }
                op = OP_SYMBOLS[op] || op;
                return [f.field, prefix + f.name.toLowerCase() + ' ' + op + ' ' + value];
            })
            .value();
    },

    render: function() {
        var _this = this;
        var summary = this.fctFilterSummary(this.props.filters);
        var items = _.map(summary, function(item) {
            var field = item[0];
            var desc = item[1].replace('_',' ');
            return <li key={field}>
                {desc}
                <small className='remove-filter'> <Glyphicon glyph='remove' onClick={_this.removeFromSummary.bind(null, field)}/></small>
            </li>;
        });
        if (summary.length !== 0) {
            return <div className="panel-footer">
                <ul className="filter-group-summary">
                    {items}
                </ul></div>;
        } else {
            return <div style={{display:'none'}}></div>;
        }
    },
});


module.exports = FilterSummary;

