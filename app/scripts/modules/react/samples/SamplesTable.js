'use strict';
var React = window.React = require('react');
var $ = require('jquery');
var _ = require('lodash');

var FixedDataTable = require('fixed-data-table');
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

var SamplesActions = require('../../actions/SamplesActions');
var SamplesColumnList = require('./SamplesColumnList');
var UtilsConstants = require('../../constants/UtilsConstants');
var VariantConstants = require('../../constants/VariantConstants');
var ASC = UtilsConstants.ASC;
var DESC = UtilsConstants.DESC;

var ReactBoostrap = require('react-bootstrap');
var ButtonGroup = ReactBoostrap.ButtonGroup;
var Button = ReactBoostrap.Button;

var SamplesStore = require('../../stores/SamplesStore');


/**
 * @class SamplesTable
 * @description Fixed-data-table for samples exposition
 */

var SamplesTable = React.createClass({
    _rowGetter: function(rowIndex) {
        return this.props.visibleSamples[rowIndex];
    },

    /* Send sort action (update SamplesStore) */
    _sortRowsBy: function(cellDataKey) {
        if (cellDataKey === this.props.sortBy) {
            var sortDirection = this.props.sortDirection === ASC ? DESC : ASC;
        } else {
            sortDirection = ASC;
        }
        SamplesActions.sortSamples(cellDataKey, sortDirection);
    },

    /* Make the column header clickable to sort items */
    _renderHeader: function(label, cellDataKey) {
        return (
            <div style={{width: "100%", textAlign: 'center'}}>
                <a onClick={this._sortRowsBy.bind(null, cellDataKey)}>{label}</a>
            </div>
        );
    },

    /* Record the table row the user scrolled to */
    _onScrollEnd: function(__,end) {
        SamplesStore.scrollPosition = end;
    },

    /* When clicking a row, add it to the selection */
    _onRowClick: function(e, rowIndex, rowData) {
        SamplesActions.selectSample(rowData);
    },

    /* Highlight selected rows */
    _rowClassNameGetter: function(rowIndex) {
        if (this.props.visibleSamples[rowIndex].selected) {
            return 'selected-sample';
        }
    },

    render: function () {
        var _this = this;
        var sc = this.props.samples;
        var columnDef = _.clone(SamplesColumnList.columnDef);

        var sortDirArrow = '';
        if (this.props.sortDirection !== null) {
            sortDirArrow = this.props.sortDirection === DESC ? ' ↓' : ' ↑';
        }

        /* Format the different cells */
        var renderers = {
            'family_id': function(family_id) {
                return <div className='nomargin'><ActivateFamilyButton samples={sc} family_id={family_id}/> {family_id}</div>;  },
            'name': function(sample_id, key, sample) {
                return <div className='nomargin'><ActivateSampleButton samples={sc} sample={sample}/> {sample.name}</div>;  },
            'phenotype': function(phenotype, key, sample) {
                return <div className='nomargin'><AffectedSwitchButton samples={sc} sample={sample}/></div>;  },
            'sex': function (sex) {
                //var symbol = sex === 'M' ? '♂' : '♀';
                //return <span className='samples-sex'>{symbol}</span>;  },
                var suffix = sex === 'M' ? '-man' : '-woman';
                return <div className={'samples-sex sample-sex'+suffix}></div>;  },
        };

        /* Define which columns to display (if no family, simplify) */
        var samples = this.props.samples.getSamples();
        if (_.every(samples, function (s) {return s.name === s.family_id;})) {
            delete columnDef.family;
            delete columnDef.father;
            delete columnDef.mother;
        }

        /* Populate the columns */
        var cols = _.chain(columnDef)
            .map(function (col) {
                return (<Column
                    key={col.key}
                    order={col.order}
                    label={col.label + (_this.props.sortBy === col.key ? sortDirArrow : '')}
                    width={col.width}
                    flexGrow={col.flexGrow}
                    dataKey={col.dataKey}
                    cellRenderer={renderers[col.key]}
                    align={col.align}
                    headerRenderer={_this._renderHeader}
                />);
            })
            .sortBy(function (c) {
                return c.props.order;
            })
            .value();

        /* The table itself */
        var nrows = this.props.visibleSamples.length;
        var rowGetter = this.props.isLoading ? function(){} : this._rowGetter;
        var rowHeight = VariantConstants.ROW_HEIGHT;
        var headerHeight = VariantConstants.HEADER_HEIGHT;
        var scrollPosition = SamplesStore.scrollPosition;   // super dirty one
        return <div className='table-container'>
                <Table
                    rowHeight={rowHeight}
                    rowGetter={rowGetter}
                    rowsCount={nrows}
                    width={this.props.containerWidth}
                    height={Math.min(this.props.containerHeight, nrows*rowHeight + headerHeight + 2)}
                    headerHeight={headerHeight}
                    onScrollEnd={this._onScrollEnd}
                    scrollTop={scrollPosition}
                    onRowClick={this._onRowClick}
                    rowClassNameGetter={this._rowClassNameGetter}
                >
                {cols}
                </Table>
                <div className='loading-message loading-message-lg' style={{display: this.props.isLoading ? 'inline' : 'none'}}>
                    {/*Loading ...*/}
                </div>
            </div>;
    }
});


/**
 * Tag a sample as active / inactive.
 **/
var ActivateFamilyButton = React.createClass({
    onFamilyActiveChange: function (e) {
        e.stopPropagation();
        $(':focus').blur();
        var family_id = e.currentTarget.name;
        SamplesActions.updateFamilyActive(family_id);
    },
    render: function () {
        var _this = this;
        var family_id = this.props.family_id;
        var isActive = this.props.samples.familyActive(family_id);
        return <Button className={(isActive ? 'checkbox-checked' : 'checkbox-unchecked')+' btn-sm add-family-button'}
                    value={isActive}
                    name={family_id}
                    onClick={_this.onFamilyActiveChange}
                ></Button>;
    },
});


/**
 * Tag a sample as active / inactive.
 **/
var ActivateSampleButton = React.createClass({
    onSampleActiveChange: function (e) {
        e.stopPropagation();
        $(':focus').blur();
        var sample_name = e.currentTarget.name;
        SamplesActions.updateSampleActive(sample_name);
    },
    render: function () {
        var _this = this;
        var sample = this.props.sample;
        var isActive = sample.active;
        return <Button className={(sample.active ? 'checkbox-checked' : 'checkbox-unchecked')+' btn-sm add-sample-button'}
                    value={isActive}
                    name={sample.name}
                    onClick={_this.onSampleActiveChange}
                ></Button>;
    },
});


/**
 * Switch between affected / not affected groups.
 **/
var AffectedSwitchButton = React.createClass({
    onGroupChange: function (e) {
        e.stopPropagation();
        var sample_name = e.currentTarget.name;
        var group_name = e.currentTarget.value;
        var groups = this.props.samples.getGroups();
        var group = _.find(groups, {'name': group_name});
        SamplesActions.updateSampleGroup(sample_name, group);
    },
    render: function () {
        var _this = this;
        var sample = this.props.sample;
        var isActive = sample.active;
        var groups = this.props.samples.getGroups();
        var groupButtons =
            _.map(groups, function (group) {
                var gname = group.name.replace(/_/g, ' ') === 'affected' ? 'yes' : 'no ';
                var inSpan;
                var own_group = sample.group === group.name;
                if ( !isActive && own_group) {
                    inSpan = <div><span>{gname}</span> <span aria-hidden="true"></span></div>;
                } else {
                    inSpan = <span>{gname}</span>;
                }
                return (
                    <Button
                        key={group.name}
                        className={'btn-sm sample_group affected-switch-button ' +
                            ((own_group && isActive) ? 'sample_group_'+group.name :
                             (own_group && !isActive) ? 'sample_group inactive' : '')}
                        value={group.name}
                        name={sample.name}
                        onClick={(own_group && isActive) ? undefined : _this.onGroupChange}
                        >
                    {inSpan}
                    </Button>
                );
            });
        return <div>
            <ButtonGroup className='affected-switch-btn-group'>
                {groupButtons}
            </ButtonGroup>
        </div>;
    },
});


module.exports = SamplesTable;

