'use strict';
var React = window.React = require('react');

/* Utils */
var _ = require('lodash');
var toastr = require('toastr');
var Api = require('../../utils/Api');

/* Actions */
var VariantActions = require('../../actions/VariantActions');

/* Constants */
var VariantColumnList = require('./VariantColumnList.js');
var UtilsConstants = require('../../constants/UtilsConstants');

/* React-bootstrap */
var ReactBoostrap = require('react-bootstrap');
var Button = ReactBoostrap.Button;
var DropdownButton = ReactBoostrap.DropdownButton;
var ButtonGroup = ReactBoostrap.ButtonGroup;
var MenuItem = ReactBoostrap.MenuItem;
var Glyphicon = ReactBoostrap.Glyphicon;
var OverlayTrigger = ReactBoostrap.OverlayTrigger;
var Popover = ReactBoostrap.Popover;
var ProgressBar = ReactBoostrap.ProgressBar;

var COLUMN_DEF = VariantColumnList.COLUMN_DEF;
var FORMATS = {
    txt: 'Excel (.txt)',
    vcf: 'VCF',
};
toastr.options = UtilsConstants.TOASTR_OPTIONS;


/**
 * Export to file button
 **/
var ExportTo = React.createClass({
    propTypes: {
        isExporting: React.PropTypes.bool,
        selectedColumns: React.PropTypes.object,
    },
    getFields: function() {
        var fields = _.chain(this.props.selectedColumns)
            .map(function (val, key) {
                return COLUMN_DEF[key];
            })
            .sortBy('order')
            .map('dataKey')
            .value();
        return fields;
    },

    export: function(format) {
        var fields = this.getFields();
        VariantActions.export(Api.getDb(), format, fields, Api.variantUrlArgs());
    },

    render: function() {
        var _this = this;

        if (this.props.isExporting) {
            return (
                <ButtonGroup>
                    <ProgressBar now={100} active style={{width:'150px', height:'34px', margin:'0', marginRight:'5px'}}/>
                </ButtonGroup>
            );
        }

        var eventKey = -1;
        var exports = _.chain(FORMATS)
            .map(function (desc, format) {
                eventKey += 1;
                return (
                    <MenuItem key={format} eventKey={eventKey} onSelect={_this.export.bind(null, format)}>
                        {desc}
                    </MenuItem>
                );
            }).value();
        var generateReportPopover = <Popover id={'goto-bookmark-tooltip'}>Generate report</Popover>;

        return (
            <ButtonGroup>
                <OverlayTrigger placement='top' overlay={generateReportPopover}>
                    <Button bsStyle='primary' id='generate-report-button' onClick={this.export.bind(null, 'report')}>
                        <Glyphicon glyph='list-alt' />
                    </Button>
                </OverlayTrigger>
                <DropdownButton id='export-to-button' bsStyle='primary' title="Export to ...">
                    {exports}
                </DropdownButton>
            </ButtonGroup>
        );
    },
});


module.exports = ExportTo;

