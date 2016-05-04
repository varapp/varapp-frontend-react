'use strict';
var React = require('react');
var FilterActions = require('../../../actions/FilterActions');
var FilterConstants = require('../../../constants/FilterConstants');

var _ = require('lodash');
var formatters = require('../../../utils/formatters.js');
var HelpTooltip = require('../../tooltips/HelpTooltip.js').HelpTooltip;
//var WithHelper = require('../../tooltips/HelpTooltip.js').WithHelper;

var ReactBootstrap = require('react-bootstrap');
var Glyphicon = ReactBootstrap.Glyphicon;
var Input = ReactBootstrap.FormControl;

/* Better formatting of inequality signs */
var OP_SIGNS = {'>=':'≥', '<=':'≤', '<':'<', '>':'>'};


/**
 * @class ContinuousValueFilter
 * @description Filter continuous values by moving a slider.
 */

class ContinuousValueFilter extends React.Component {
    constructor(props) {
        super(props);
        /* Use props to init the internal state only */
        this.state = {mode: 'slider'};
        this.switchMode = this.switchMode.bind(this);
    }

    switchMode() {
        var mode;
        if (this.state.mode === 'slider') {mode = 'text';}
        else if (this.state.mode === 'text') {mode = 'slider';}
        this.setState({mode: mode});
    }

    render() {
        var name = this.props.name;
        if (this.props.globalStats === undefined) {
            return (<div className='loading-filter'></div>);
        }
        var disabled = this.props.globalStats.min === this.props.globalStats.max;

        var input, glyph;
        var type = this.props.type;
        if (this.state.mode === 'slider' || disabled) {
            glyph = 'edit';
            if (type === FilterConstants.FILTER_TYPE_CONTINUOUS) {
                input = <SliderContinuous {...this.props} disabled={disabled} />;
            } else if (type === FilterConstants.FILTER_TYPE_FREQUENCY) {
                input = <SliderFrequency {...this.props} disabled={disabled} />;
            }
        } else if (this.state.mode === 'text') {
            glyph = 'resize-horizontal';
            input = <TextInput {...this.props} />;
        }

        return (
            <div id={'one-filter-'+this.props.field} className="one-filter continuous-value-filter">
                <div className="filter-name">
                    {name}
                    {/* Tooltip question mark */}
                    <span style={{paddingLeft: '10px'}}>
                        <HelpTooltip name={this.props.field} category={'filters'} />
                    </span>
                </div>
                <div className="select filter-input">
                    {input}
                    {/* Button to switch between slider or text input */}
                    {disabled ? <span></span> :
                        <div className='switch-input-mode pointme pull-right' style={{marginLeft:'2px'}}
                            onClick={this.switchMode}>
                            <Glyphicon glyph={glyph} />
                        </div>}
                </div>
            </div>
        );
    }
}


/**
 * Text field to enter the desired filtering value
 **/
class TextInput extends React.Component {
    constructor(props) {
        super(props);
        /* Use props to init the internal state only */
        this.state = {
            value: props.value,
            valid: this.validateNumericInput(props.value),
        };
        this._onTextChange = this._onTextChange.bind(this);
    }
    _onTextChange(e) {
        var globalStats = this.props.globalStats;
        var maxi = globalStats.max;
        var mini = globalStats.min;
        var value = e.target.value;
        if (value === '') {
            value = this.props.reverse ? maxi : mini;
        }
        var valid = this.validateNumericInput(value);
        value = parseFloat(value);
        if (e.keyCode === 13 && valid) {
            var isDefault = this.props.reverse ? value >= maxi : value <= mini;
            FilterActions.updateOneFilterValue(this.props.field, isDefault ? undefined : value);
        }
        this.setState({ value, valid });
    }
    validateNumericInput(s) {
        var re = /^[+-]?\d+([\.,]\d+)?$/;
        return !s || s.length === 0 || re.test(s);
    }
    render() {
        var op = this.props.op;
        var opsign = OP_SIGNS[op];
        var value = this.state.value;
        if (value === undefined) {
            var globalStats = this.props.globalStats;
            var maxi = globalStats.max;
            var mini = globalStats.min;
            value = this.props.reverse ? maxi : mini;
        } else {
            value = parseFloat(value);
        }
        value = formatters.roundLowScores(value) || '';
        return (<div className='inline continuous-input'>
            <Input ref="thisInput"
                className='has-error inline col-sm-2'
                type="text"
                bsSize='small'
                defaultValue={value}
                onKeyUp={this._onTextChange}
                addonBefore={' '+ opsign + ' '}
                bsStyle={this.state.valid ? null : 'error'}
            /></div>);
    }
}


/**
 * Slider widget to select the filtering value among a given subset of values
 **/
class SliderFrequency extends React.Component {
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
    /* Find the index of the number in array *arr* that is closest to number *num* */
    closest(num, arr) {
        var mid;
        var lo = 0;
        var hi = arr.length - 1;
        while (hi - lo > 1) {
            mid = Math.floor ((lo + hi) / 2);
            if (arr[mid] < num) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        if (num - arr[lo] <= arr[hi] - num) {
            return lo;
        }
        return hi;
    }
    onChange(e) {
        var breaks = this.props.globalStats.breaks;
        var i = parseInt(e.target.value);
        var breaksMap = _.zipObject(_.range(breaks.length), breaks);
        var value = breaksMap[i];
        /* If extreme value, don't create a filter (send value=undefined) */
        var isDefault = this.props.reverse ?
            i === breaks.length - 1 :
            i === 0;
        this.setState({value: value});  // change visually right away
        FilterActions.updateOneFilterValue(this.props.field, isDefault ? undefined : value);
    }
    /**
     * Add the ticks to the slider. {idx, val} are the currently selected index and value
     * to be replaced in case something more specific was entered via text field
     **/
    ticks(idx, val) {
        var breaks = this.props.globalStats.breaks;
        var n = breaks.length;
        breaks[idx] = val;  // replace the current value
        var ticks = _.map(breaks, function (v, ix) {
            return {
                pc: 95 * ix / (n - 1),   // divide in n parts
                text: formatters.formatFrequencyPercent(v),
                align: 'center'
            };
        });
        ticks[0].align = 'left';
        ticks[4].text = '1';
        var spanTicks = _.map(ticks, function (t) {
            return <div style={{position:'absolute', left:''+t.pc+'%'}}
                        key={t.pc}
                        className={'ticks text-'+t.align}>
                   {/*i!==0 ? '' : opsign*/}{t.text}
                   </div>;
        });
        var spanText = <div className='frequency-slider-ticks' style={{ position:'relative'}}>
                {spanTicks}
            </div>;
        return spanText;
    }
    render() {
        var value = this.state.value;
        var breaks = this.props.globalStats.breaks;
        value = parseFloat(value !== undefined ? value : (this.props.reverse ? 1 : 0));
        /* If the value exists in the breaks, take its index. Otherwise take the closest one. */
        var i = breaks.indexOf(value);
        if (i < 0) {
            i = this.closest(value, breaks);
        }
        return (<div className='inline continuous-input'>
                <input
                    ref='slider'
                    type="range"
                    value={i}
                    min={0}
                    max={breaks.length - 1}
                    onChange={this.onChange}
                    >
                </input>
                {this.ticks(i, value)}
            </div>
        );
    }
}


/**
 * Slider widget to select the filtering value abritrarily between min and max
 **/
class SliderContinuous extends React.Component {
    constructor(props) {
        this._nbreaks = 100;
        this.state = this.newStateFromProps(props);
        this.onSliderChange = this.onSliderChange.bind(this);
        this.onSliderUpdate = this.onSliderUpdate.bind(this);
    }
    /* Because the props might change as the result of another action, like changing the db,
       the state needs to be updated when props are received */
    componentWillReceiveProps(nextProps) {
        var nextState = this.newStateFromProps(nextProps);
        this.setState(nextState);
    }
    /* Use props to init the internal state only */
    newStateFromProps(props) {
        var globalStats = props.globalStats;
        var mini = globalStats.min;
        var maxi = globalStats.max;
        var value = parseFloat(props.value) || (props.reverse ? maxi : mini);
        var i = (value === mini) ? 0 : this._nbreaks * (value-mini) / (maxi-mini);
        return {
            i: i,   // break #, or position of the slider
            value: value,  // Actual filter value
        };
    }
    /* The slider cursor is help up, changing position without actually filtering */
    onSliderChange(e) {
        var globalStats = this.props.globalStats;
        var maxi = globalStats.max;
        var mini = globalStats.min;
        var i = parseInt(e.target.value);
        var value = mini + (i/this._nbreaks) * (maxi-mini);
        this.setState({
            i: i,
            value: value,
        });
    }
    /* The slider cursor is let down, triggering a filter update */
    onSliderUpdate() {
        var value = this.state.value;
        /* If extreme value, don't create a filter (send value=undefined) */
        var isDefault = this.props.reverse ?
            this.state.i === this._nbreaks - 1 :
            this.state.i === 0;
        FilterActions.updateOneFilterValue(this.props.field, isDefault ? undefined : value);
    }
    render() {
        var i = this.state.i;
        var disabled = this.props.disabled;
        var value = this.state.value;
        /* Format the little '>= 0.01' bottom-right text */
        var opsign = OP_SIGNS[this.props.op];
        var spanValue = formatters.roundLowScores(value);
        var spanText = <span className="pull-right">
                {opsign + ' '} <span className='continuous-value-text'>{spanValue}</span>
            </span>;
        return (<div className='inline continuous-input'>
                <input
                    ref='slider'
                    type="range"
                    value={i}
                    min={0}
                    max={this._nbreaks - 1}
                    onChange={disabled ? undefined : this.onSliderChange}
                    onMouseUp={disabled ? undefined : this.onSliderUpdate}
                    disabled={disabled}
                    >
                </input>
                {spanText}
            </div>);
    }
}


module.exports = ContinuousValueFilter;

