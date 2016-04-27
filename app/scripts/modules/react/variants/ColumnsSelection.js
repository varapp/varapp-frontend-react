'use strict';
var React = window.React = require('react');

/* Utils */
var _ = require('lodash');
var toastr = require('toastr');
var HelpTooltipDescriptions = require('../tooltips/HelpTooltipDescriptions');

/* Actions */
var VariantActions = require('../../actions/VariantActions.js');

/* Constants */
var VariantColumnList = require('./VariantColumnList.js');
var UtilsConstants = require('../../constants/UtilsConstants');

/* React-bootstrap */
var ReactBoostrap = require('react-bootstrap');
var DropdownButton = ReactBoostrap.DropdownButton;
var Glyphicon = ReactBoostrap.Glyphicon;
var MenuItem = ReactBoostrap.MenuItem;
var Popover = ReactBoostrap.Popover;
var OverlayTrigger = ReactBoostrap.OverlayTrigger;

var COLUMNS_DEF = VariantColumnList.COLUMN_DEF;
var DESCRIPTIONS = HelpTooltipDescriptions.variant_columns;
var N = 16; // number of items per column
toastr.options = UtilsConstants.TOASTR_OPTIONS;
var preventDefault = e => e.preventDefault();


/**
 * Button for columns selection
 **/
var ColumnsSelection = React.createClass({
    changeOneSelectedColumn: function (key) {
        var selectedColumns = this.props.selectedColumns;
        /* Add one */
        if (!selectedColumns[key]) {
            VariantActions.addOrRemoveColumn(key, true);
        /* Remove one */
        } else {
            VariantActions.addOrRemoveColumn(key, false);
        }
    },

    render: function() {
        /*
         * The Overlay is important, it is the hack that leaves the menu open !
         * (could be solved in another way but that works)
         */
        var _this = this;
        var j = 0;
        var selectedColumns = this.props.selectedColumns;
        var selectColsMenuItems = _.chain(COLUMNS_DEF)
            .omit('source')
            .groupBy('type')
            /* Group first by category (quality, pathogenicity, etc.) */
            .map(function(elts, colType) {
                /* In each category, build a list of MenuItems (with a popup) */
                var subgroup = _.map(elts, function(x) {
                    var key = x.key;
                    var label = x.label;
                    var popover = <Popover id={'column-tooltip-'+key}>{DESCRIPTIONS[key] || key}</Popover>;
                    j = j+1;
                    return (
                        <OverlayTrigger key={key} placement='right' overlay={popover}>
                        <MenuItem key={key} eventKey={key} onSelect={_this.changeOneSelectedColumn.bind(null, key)}>
                            <span style={{display:'inline-block', width: '20px'}}>
                                {selectedColumns[key] ? <Glyphicon glyph='ok' /> : <span></span>}
                            </span>
                            {' ' + label}
                        </MenuItem>
                        </OverlayTrigger>
                    );
                });
                /* Add the title of the category */
                subgroup.unshift(<div key={'type-'+colType} className='select-columns-section-header'>
                    <span>{colType}</span></div>);
                j = j+1;
                /* Draw a separating line. Don't draw it if on top of the column */
                if (j%N !== 0) {
                    subgroup.push(<hr key={'hr-'+colType}/>);
                    j = j+1;
                }
                /* Fill the space if too close to the bottom, so the title is on top of the next column */
                var remain = N-j%N;
                if (remain < 3) {
                    for (var k=0; k<remain; k++) {
                        subgroup.push(<div key={'filler-'+colType+k} style={{display:'none'}}></div>);
                        j = j+1;
                    }
                }
                return subgroup;
            })
            .flatten()
            .value();

        return (
            <DropdownButton id='select-columns-button' bsStyle='primary' title="Select columns"
                onSelect={preventDefault} onClick={preventDefault}>
                <div className='container select-columns-container' style={{overflow:'auto', marginBottom: '5px'}}>
                <div className='row'>
                    <div className='col-sm-3'>{selectColsMenuItems.slice(0,N)}</div>
                    <div className='col-sm-3'>{selectColsMenuItems.slice(N,2*N)}</div>
                    <div className='col-sm-3'>{selectColsMenuItems.slice(2*N,3*N)}</div>
                    <div className='col-sm-3'>{selectColsMenuItems.slice(3*N,4*N)}</div>
                </div>
                </div>
            </DropdownButton>
        );
    },
});


module.exports = ColumnsSelection;
