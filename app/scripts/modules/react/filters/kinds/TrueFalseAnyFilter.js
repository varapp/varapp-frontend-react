'use strict';
var React = require('react');
var formatters = require('../../../utils/formatters');
var FilterActions = require('../../../actions/FilterActions');
var HelpTooltip = require('../../tooltips/HelpTooltip.js').HelpTooltip;

/**
 * @class TrueFalseAnyFilter
 * @description pickup value for binary field, which can be true, false or none
 */

class TrueFalseAnyFilter extends React.Component {
    constructor(props) {
        super(props);
        /* Use props to init the internal state only */
        this.state = {value: props.value};
        this.onChange = this.onChange.bind(this);
    }
    /* Because the props might change as the result of another action, like changing the db,
       the state needs to be updated when props are received */
    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value});
    }

    onChange(e) {
        var convert = {
            'true':true,
            'false':false
        };
        var value = convert[e.target.value];
        this.setState({value: value});  // change checked state right away
        FilterActions.updateOneFilterValue(this.props.field, value);
    }

    render() {
        var stats = this.props.stats || {true:0, false:0};
        var key = this.props.key;
        var value = this.state.value;
        var countBadge = function (option, val) {
            /* `option` is true or false or undefined; it represents one of the 3 check options.
               `val` is the current state of the choice - also true or false or undefined. */
            return (option !== val && option !== undefined && (stats[option] === undefined || stats[option] === 0)) ?
                <span></span> :
                <span className="badge count">{formatters.kmCount(stats[option] || 0)}</span>;
        };

        return (
            <div id={'one-filter-'+this.props.field} className="one-filter truefalseany-filter">
                <div className="filter-name">
                    {this.props.name}
                    <span style={{paddingLeft: '5px'}}>
                        <HelpTooltip name={this.props.field} category={'filters'} />
                    </span>
                </div>
                <div className="filter-input">
                    {/* TRUE */}
                    <div className="one-choice one-choice-true-false">
                        <div className="option-name">
                            <input
                                type="radio"
                                name={key}
                                checked={value === true}
                                onChange={this.onChange}
                                value="true"
                            />
                            <span> yes</span>
                        </div>
                        <small className="true">
                            {countBadge(true, value)}
                        </small>
                    </div>
                    {/* FALSE */}
                    <div className="one-choice one-choice-true-false">
                        <div className="option-name">
                            <input
                                type="radio"
                                name={key}
                                checked={value === false}
                                onChange={this.onChange}
                                value="false"
                            />
                            <span> no</span>
                        </div>
                        <small className="false">
                            {countBadge(false, value)}
                        </small>
                    </div>
                    {/* ANY */}
                    <div className="one-choice once-choice-any">
                        <div className="option-name">
                            <input
                                type="radio"
                                name={key}
                                checked={value === undefined}
                                onChange={this.onChange}
                                value="any"
                            />
                            <span> any</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = TrueFalseAnyFilter;

