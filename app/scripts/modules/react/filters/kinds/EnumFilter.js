'use strict';
var React = require('react');
var _ = require('lodash');
var FilterActions = require('../../../actions/FilterActions');
var TextShort = require('../../utils/TextShort.js');
var formatters = require('../../../utils/formatters.js');
var HelpTooltip = require('../../tooltips/HelpTooltip.js').HelpTooltip;

/**
 * @class EnumFilter
 * @description Filter with checkboxes, representing all the different values it can take.
 */


var ENUMS = {
    'pass_filter': ['PASS','LowQual'],
    'polyphen_pred': ['probably_damaging','possibly_damaging','benign','unknown'],
    'sift_pred': ['deleterious','deleterious_low_confidence','tolerated_low_confidence','tolerated'],
};


/* Return `items` but with `enum_values` first in the list, if present in `items`. */
var sort_enum = function (items, enum_values) {
    /* No particular order defined above, just sort alphabetically */
    if (enum_values === undefined) {
        return _.sortBy(items, 'key');
    }
    /* No items to sort */
    if (items === undefined) { return []; }
    var newitems = items.slice();
    /* Remove elements of `enum_values` that are not present in items */
    _.remove(enum_values, function(v){
        return items.indexOf(v) < 0;
    });
    /* Remove elements of `items` already present in `enum_values` */
    _.remove(newitems, function(v){
        return enum_values.indexOf(v) >= 0;
    });
    /* Put `enum_values` in front and paste the rest of `items` afterwards. */
    return enum_values.concat(newitems.sort());
};


class EnumFilter extends React.Component {
    constructor(props) {
        this.state = this.newStateFromProps(props);
        this.checkOne = this.checkOne.bind(this);
        this.checkAll = this.checkAll.bind(this);
    }
    /* Because the props might change as the result of another action, like changing the db,
       the state needs to be updated when props are received */
    componentWillReceiveProps(nextProps) {
        var nextState = this.newStateFromProps(nextProps);
        this.setState(nextState);
    }
    /* Use props to init the internal state only
       Return an object {option: true, ...} with a key for each selected checkbox */
    newStateFromProps(props) {
        var selected = {};
        if (props.value) {
            _.each(props.value.split(','), function (v) {
                selected[v] = true;
            });
        }
        return { selected };
    }

    /* Checkbox clicked: update the *selected* state to add or remove an option,
       and send update filter action to filter: field->selected.
       Reads that box's value to know what to update. */
    checkOne(e) {
        var _this = this;
        var globalStats = this.props.globalStats;
        var text = e.target.value;
        var selected = this.state.selected;
        if (e.target.checked) {
            selected[text] = true;
        } else {
            delete selected[text];
        }
        var nselected = _.size(selected);
        this.setState({selected: selected});
        var allOrNoneSelected = (nselected===0 || nselected===_.size(globalStats));
        var value = _.keys(selected).join(',');
        FilterActions.updateOneFilterValue(_this.props.field, allOrNoneSelected ? undefined : value);
    }

    /* 'Select all' checkbox clicked: update the *selected* state to add all options or empty it,
       and send update filter action to filter: field->selected.
       If no *options* are given, all of globalStats keys are used. */
    checkAll(values) {
        var _this = this;
        var selected = this.state.selected;
        var globalStats = this.props.globalStats;
        var options = values;  // for ESlint
        if (options === undefined) {
            options = _.keys(globalStats);
        }
        var selectedOptions = _.pick(selected, options);
        var isActive = (_.size(selectedOptions) > 0);
        if (isActive) { // Deactivate all
            _.forEach(options, function(v) {delete selected[v];});
        } else { // Activate all
            _.forEach(options, function(v) {selected[v] = true;});
        }
        var nselected = _.size(selected);
        var ntotal = _.size(globalStats);
        this.setState({ selected });
        var allOrNoneSelected = (nselected===0 || nselected===ntotal);
        var value = _.keys(selected).join(',');
        FilterActions.updateOneFilterValue(_this.props.field, allOrNoneSelected ? undefined : value);
    }

    render() {
        if (this.props.stats === undefined || this.props.globalStats === undefined) {
            return <div className='loading-filter'></div>;
        }
        // Options with no name (NULL values) are not interesting to filter on
        delete this.props.stats[''];
        delete this.props.globalStats[''];
        return (
            <div className={"one-filter enum-filter enum-filter-"+this.props.name}>
                {this.props.field === 'impact' ?
                    <ImpactChoices selected={this.state.selected} {...this.props}
                        checkOne={this.checkOne} checkAll={this.checkAll} />
                 :
                    <Choices selected={this.state.selected} {...this.props}
                        checkOne={this.checkOne} checkAll={this.checkAll} />
                }
            </div>
        );
    }
}


/**
 * Creates a list of checkboxes to select each of the possible options,
 * topped by another checkbox to (de-)selected them all.
 * The possible options are read in globalStats.
 * It is the component used for instance to display PassFilter, Polyphen, or Sift predictions.
 **/
class Choices extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var {name, selected, globalStats, stats, field, checkAll, ...others} = this.props;
        var desc_category = 'filters';
        var desc_key = field;

        // Pass filter special case: what we want to be PASS is None in the db (passed as null in JSON)
        if (field === 'pass_filter' && null in globalStats) {
            stats.PASS = stats.null;
            globalStats.PASS = globalStats.null;
        // Impact special case: search descriptions in a different way
        } else if (field === 'impact') {
            desc_category = 'impact_severity';
            desc_key = name;
        }

        // Check/unckeck all button
        var isActive = (_.size(selected) > 0);
        var checkAllButton =
            <input
                type='checkbox'
                value={isActive}
                checked={isActive}
                onChange={checkAll.bind(null, _.keys(globalStats))}
            />;

        // Filter title: the readable field name, together with a help tooltip and a 'check all' checkbox
        var header = <div>
            {checkAllButton}
            <span style={{paddingLeft: '5px'}}>
                {' '+name}
            </span>
            <span style={{paddingLeft: '5px'}}>
                <HelpTooltip name={desc_key} category={desc_category} placement='right' />
            </span>
        </div>;

        // Include every option found in globalStats
        var options = _.keys(globalStats);

        return <div className={"enum-filter-"+name}>
                <div className="filter-name enum-filter-name">
                    {header}
                </div>
                <ChoicesList options={options} {...this.props} />
            </div>;
    }
}
Choices.propTypes = {
    selected: React.PropTypes.object,
    checkOne: React.PropTypes.func,
    checkAll: React.PropTypes.func,
};


/**
 * A group of Choices, one per impact severity
 **/
class ImpactChoices extends React.Component {
    constructor(props) {
        var _this = this;
        super(props);
        this.colors = {
            'HIGH': '#d9534f',
            'MED': 'sandybrown',
            'LOW': 'forestgreen',
        };
        _.forEach(props.globalStats.pairs, function(impacts, severity) {
            _.map(impacts, function(v) {
                _this.colors[v] = _this.colors[severity];
            });
        });
    }

    render() {
        var _this = this;
        var {name, selected, globalStats, ...others} = this.props;
        var pairs = globalStats.pairs;
        var choices = _.map(['HIGH','MED','LOW'], function(severity) {
            var sel = _.pick(selected, pairs[severity]);
            var global = _.pick(globalStats, pairs[severity]);
            var color = _this.colors[severity];
            return <Choices key={severity} name={severity} selected={sel} globalStats={global} color={color} {...others} />;
        });
        return <div>{choices}</div>;
    }
}


/**
 * Creates a list of checkboxes to select each of the possible options,
 * i.e. divs containing each a checkbox, an option description, and a help tooltip
 **/
class ChoicesList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var {options, field, stats, globalStats, selected, checkOne, color, ...others} = this.props;
        // The list of possible values for that field, reordered by sort_enum
        var enum_values = sort_enum(options, ENUMS[field]);
        var choices = _.chain(enum_values)
            .map(function (v) {
                var count = (v in stats) ? stats[v] : 0;
                var checked = (v in selected) ? selected[v] : false;
                return {val: v, count: count, checked: checked};
            })
            .filter(function (x) {
                // Remove null values
                return x.val !== null && x.val !== 'null' && x.val !== undefined && x.count !== undefined;
            })
            .filter(function (x) {
                // Remove "SPLICE MACHIN+AUTRE TRUC" from new gemini db
                return ! (/[A-Z\ ]+\+/).test(x.val);
            })
            .map(function (e, i) {
                /* The container to display the count for that value */
                var countBadge = function () {
                    return (e.count === 0 && !e.checked) ?
                        <span></span> :
                        <span className="badge count pull-right">
                            {e.count}
                        </span>;
                };
                /* The text in front of the checkbox */
                var fullText =formatters.enumElem(e.val).replace(/\ variant$/g, '');
                var text = <TextShort text = {fullText} max={21} maxWords={3}/>;
                /* The help tooltip */
                var help = <HelpTooltip name={e.val} category={field} />;
                return (
                    <div key={'choice-'+i}>
                        <div className={"enum-filter-choices enum-filter-choices-"+e.val} key={name+'-'+e.val}>
                            <div className="enum-filter-input">
                                <input
                                    type='checkbox'
                                    value={e.val}
                                    name={e.val}
                                    checked={e.checked}
                                    onChange={checkOne}
                                />
                                <span style={{color: color}}>
                                    {text}
                                </span>
                                <span style={{display: 'inline-block', paddingLeft: '5px'}}>
                                    {help}
                                </span>
                                <small>
                                    {countBadge()}
                                </small>
                            </div>
                        </div>
                    </div>
                );
            })
            .value();
        return <div>{choices}</div>;
    }
}



module.exports = EnumFilter;

