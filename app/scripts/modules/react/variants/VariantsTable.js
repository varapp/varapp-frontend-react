'use strict';
var React = window.React = require('react');

/* Components */
var FixedDataTable = require('fixed-data-table');
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;
//var Cell = FixedDataTable.Cell;

/* Utils */
var _ = require('lodash');
var $ = require('jquery');
var Dimensions = require('react-dimensions');
var formatters = require('../../utils/formatters.js');
var Api = require('../../utils/Api');

/* Stores */
var SamplesStore = require('../../stores/SamplesStore');
var VariantStore = require('../../stores/VariantStore');

/* Actions */
var VariantActions = require('../../actions/VariantActions.js');

/* Constants */
var VariantColumnList = require('./VariantColumnList');
var UtilsConstants = require('../../constants/UtilsConstants');
var VariantConstants = require('../../constants/VariantConstants');
var ASC = UtilsConstants.ASC;
var COLUMN_DEF = VariantColumnList.COLUMN_DEF;


/**
 * @class VariantsTable
 * @description fixed-data-table to display variants
 */


/****************************************************************
 *********************    THE TABLE ITSELF   ********************
 ****************************************************************/


var VariantsTable = React.createClass({

    getInitialState: function () {
        this.rowIndex = 0;
        return {
            lookedUpVariant: {},
            sortBy: 'chrom',
            sortDir: null,
        };
    },

    /* Because onScrollEnd only knows startPixel and endPixel, and refers to the first displayed row,
       it is not trival to recover the currend row index, even knowing the row height. So we record the
       row index in rowGetter and use it here. */
    _onScrollEnd: function() {
        var nVariants = VariantStore.size();
        var rowIndex = this.rowIndex;
        if (!VariantStore.isLoadingNextRowBatch() && !VariantStore.noMoreVariantsToLoad()
            && nVariants > 0 && rowIndex+1 === nVariants) {
                VariantActions.loadNextRowBatch(Api.getDb(), nVariants, Api.variantUrlArgs());
        }
    },

    _rowGetter: function(rowIndex) {
        this.rowIndex = Math.max(rowIndex, this.rowIndex); // because onScrollEnd
        return this.props.variants[rowIndex];
    },

    _sortRowsBy: function(cellDataKey) {
        VariantActions.sortVariants(cellDataKey);
    },

    /* Make the column header clickable to sort items */
    _renderHeader: function(sortable, label, cellDataKey) {
        var title;
        if (sortable !== false) {
            title = <a onClick={this._sortRowsBy.bind(null, cellDataKey)}>{label}</a>;
        } else {
            title = label;
        }
        return (
            <div style={{width: "100%", textAlign: 'center'}}>
                {title}
            </div>
        );
    },

    /* Show line nr under the mouse */
    _onRowMouseEnter: function(event, rowIndex) {
        $('#lineNr').html('row #'+ (rowIndex+1));
    },

    /* Highlight looked-up variant */
    _onRowClick: function(e, rowIndex, rowData) {
        this.setState({
            lookedUpVariant: rowData,
        });
    },
    _rowClassNameGetter: function(rowIndex) {
        if (this.state.lookedUpVariant && this.props.variants
            && this.props.variants[rowIndex].variant_id === this.state.lookedUpVariant.variant_id) {
            return 'selected-variant';
        }
    },

    /* Trigger opening the Lookup panel with info on the variant */
    variantLookup: function(variant, field) {
        VariantActions.variantLookup(variant, field);
    },

    render: function() {
        var _this = this;

        /* Arrow showing the sorting direction */
        var sortDirArrow = '';
        if (VariantStore.sortDirection !== null) {
            sortDirArrow = VariantStore.sortDirection === ASC ? '↓ ' : '↑ ';
        }

        /* Format genotypes
         * This one is a mess because it requires 1. the sample groups 2. the current width
         * 3. the style to be recalculated each time the width changes, but not if the width remains the same.
         */
        var samples = SamplesStore.getSamplesCollection();
        var activeSamples = samples.getActiveSamples();
        var samplesSortBy = VariantStore.getSamplesSortBy();
        var samplesSortDirection = VariantStore.getSamplesSortDirection();
        var genotypeScalingStyle;
        var formatGenotypesIndex = function (gis, cellDataKey, rowData, rowIndex, columnData, width) {
            var spans = formatters.formatGenotypes(gis, activeSamples, samplesSortBy, samplesSortDirection);
            // Make a transformation to occupy the full width
            if (genotypeScalingStyle===undefined){
                var n = _.size(activeSamples);
                genotypeScalingStyle = formatters.calculateGenotypesScalingStyle(n, width);
            }
            return (
                <div className={'genotypes-container'}
                    onClick={_this.variantLookup.bind(null, rowData, cellDataKey)}>
                    <div style={genotypeScalingStyle}>{spans}</div>
                </div>
            );
        };

        /* Generate the columns */
        var cols = _.chain(_this.props.selectedColumns)
            .keys()
            .map(function (n) {
                var col = COLUMN_DEF[n];
                if (col === undefined) {
                    throw new Error("Undefined column "+n);
                }
                return (<Column
                    key={col.key}
                    order={col.order}
                    label={(VariantStore.sortBy === col.key ? sortDirArrow : '') + col.label}
                    //header={<Cell>(VariantStore.sortBy === col.key ? sortDirArrow : '') + col.label</Cell>}
                    headerRenderer={_this._renderHeader.bind(null, col.sortable)}
                    width={col.width}
                    minWidth={col.minWidth}
                    flexGrow={col.flexGrow}
                    dataKey={col.dataKey}
                    cellRenderer={(col.key === 'genotypes' && activeSamples.length > 0) ? formatGenotypesIndex : col.cellRenderer}
                    align={col.align}
                    />);
            })
            .sortBy(function (c) {
                return c.props.order;
            })
            .value();

        /* The table itself */
        var nvariants = VariantStore.size();
        var rowGetter = this.props.isLoading ? function(){} : this._rowGetter;
        var rowHeight = VariantConstants.ROW_HEIGHT;
        var headerHeight = VariantConstants.HEADER_HEIGHT;
        return <div className='table-container'>
                <Table
                    rowHeight={rowHeight}
                    rowGetter={rowGetter}
                    rowsCount={nvariants}
                    width={this.props.containerWidth}
                    height={Math.min(this.props.containerHeight, nvariants*rowHeight + headerHeight + 20 + 2)}
                    headerHeight={headerHeight}
                    onRowMouseEnter={this._onRowMouseEnter}
                    onScrollEnd={this._onScrollEnd}
                    onRowClick={this._onRowClick}
                    rowClassNameGetter={this._rowClassNameGetter}
                >
                {cols}
                </Table>
                <div className='loading-message loading-message-lg' style={{display: this.props.isLoading ? 'inline' : 'none'}}>
                    {/*Loading ...*/}
                </div>
                <div className='loading-message loading-next-rows' style={{display: this.props.isLoadingNextRowBatch ? 'inline' : 'none'}}>
                    {/*Loading more variants ...*/}
                    Loading more variants ...
                </div>
            </div>;
    },
});

VariantsTable = Dimensions()(VariantsTable);
module.exports = VariantsTable;



