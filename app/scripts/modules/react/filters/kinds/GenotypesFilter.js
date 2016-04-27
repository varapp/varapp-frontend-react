'use strict';
var React = require('react');
var _ = require('lodash');
var FilterActions = require('../../../actions/FilterActions');
var formatters = require('../../../utils/formatters.js');
var HelpTooltip = require('../../tooltips/HelpTooltip.js').HelpTooltip;
/**
 * @class GenotypesFilter
 * @description Options of genotypic scenarios
 */


class GenotypesFilter extends React.Component {
    constructor(props) {
        super(props);
        /* Use props to init the internal state only */
        this.state = {value: props.value || 'active'};
        this.onChange = this.onChange.bind(this);
    }
    /* Because the props might change as the result of another action, like changing the db,
       the state needs to be updated when props are received */
    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value || 'active'});
    }

    onChange(e) {
        var value = e.target.value;
        this.setState({value: value});  // change checked state right away
        FilterActions.updateOneFilterValue(this.props.field, value);
    }

    render() {
        var _this = this;
        var value = this.state.value;
        var choices = _.chain(['active','dominant','recessive','de_novo','compound_het','x_linked'])
            .map(function (scenario) {
                var key = _this.props.name + '-' + scenario;
                var checked = value === scenario;
                return (
                    <div className="genotypes-filter-choices" key={key}>
                        {/*<div className="filter-name genotypes-filter-name">{nameStr}</div>*/}
                        <div className="genotypes-filter-input">
                            <input
                                className={value === scenario ? 'checked' : ''}
                                type='radio'
                                name={scenario}
                                value={scenario}
                                checked={checked}
                                onChange={_this.onChange}
                            />
                            <span>
                                {' '+formatters.enumElem(scenario.replace('active','none'))}
                            </span>
                            <span style={{paddingLeft: '5px'}}>
                                <HelpTooltip name={scenario} category={'scenario'} />
                            </span>
                            <small><span className="badge count pull-right">{scenario.count}</span></small>
                        </div>
                    </div>
                );
            })
            .value();

        return (
            <div className="one-filter genotypes-filter">
                {choices}
            </div>
        );
    }
}


module.exports = GenotypesFilter;

