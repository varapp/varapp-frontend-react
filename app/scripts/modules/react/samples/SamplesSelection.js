'use strict';
var React = window.React = require('react');
var $ = require('jquery');
var _ = require('lodash');

var SamplesStore = require('../../stores/SamplesStore');
var VariantStore = require('../../stores/VariantStore');
var FilterStore = require('../../stores/FilterStore');

var SamplesActions = require('../../actions/SamplesActions');
var SamplesTable = require('./SamplesTable');

var AuthenticatedComponent = require('../login/AuthenticatedComponent');
var Dimensions = require('react-dimensions');
var Confirm = require('../utils/Confirm');

var ReactBootstrap = require('react-bootstrap');
var ButtonGroup = ReactBootstrap.ButtonGroup;
var Button = ReactBootstrap.Button;
var Panel = ReactBootstrap.Panel;
var Popover = ReactBootstrap.Popover;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var LinkToVarapp = require('../utils/LinkToVarapp');

var UtilsConstants = require('../../constants/UtilsConstants');
var ASC = UtilsConstants.ASC;


/**
 * @class SamplesSelection
 * @description Samples selection window
 * Route component
 */
var SamplesSelection = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    getInitialState: function () {
        return this._stateFromStore();
    },
    /* Make sure to reload the component whenever a change occurs in either filters or samples,
       for variant summary to always display stats. */
    componentDidMount: function () {
        SamplesStore.addChangeListener(this._onDataChange);
        FilterStore.addChangeListener(this._onDataChange);
    },
    componentWillUnmount: function () {
        SamplesStore.removeChangeListener(this._onDataChange);
        FilterStore.removeChangeListener(this._onDataChange);
    },
    _stateFromStore: function() {
        var isLoading = ! SamplesStore.isReady();
        var sortBy = SamplesStore.sortBy;
        var sortDirection = SamplesStore.sortDirection;
        var variantStats = SamplesStore.getVariantStats();
        var samples = SamplesStore.getSamplesCollection();
        var visibleSamples = samples.getVisibleSamples();
        visibleSamples = _.sortBy(visibleSamples, sortBy);
        if (sortDirection === ASC) {visibleSamples.reverse();}
        return {
            sortBy: (sortBy instanceof Array) ? sortBy[0] : sortBy,  // pass only the first sorting key
            sortDirection: sortDirection,
            samples: samples,
            visibleSamples: visibleSamples,
            variantStats: variantStats,
            isLoading: isLoading,
        };
    },
    /* When stored samples change, update the component and fetch new variants accordingly */
    _onDataChange: function () {
        /* State update */
        var samplesGroupStrings = SamplesStore.getSamplesCollection().buildGroupStrings();
        var localQuery = JSON.parse(localStorage.getItem('query')) || {};
        localQuery.samples = samplesGroupStrings;
        localStorage.setItem('query', JSON.stringify(localQuery));
        this.setState(
            this._stateFromStore()
        );
    },

    render: function () {
        var user = this.props.user;
        var db = this.props.db;
        if (user && !db) {
            return <p className='login-message'>{"No database available for user " + user.username}</p>;
        }
        SamplesTable = Dimensions()(SamplesTable);
        return (
            <div className='row'>
                <div id="samples-selection" className="col-lg-12">
                    <VariantsSummary variantStats={this.state.variantStats} />
                    <SamplesToolbar samples={this.state.samples} db={this.props.db}/>
                    <div id='samples-table'>
                        <SamplesTable
                            sortBy={this.state.sortBy}
                            sortDirection={this.state.sortDirection}
                            samples={this.state.samples}
                            visibleSamples={this.state.visibleSamples}
                            isLoading={this.state.isLoading} />
                    </div>
                    <Button className='back-button btn btn-primary' onClick={this.context.router.goBack}>Back</Button>
                </div>
            </div>
        );
    },
});


/**
 * Show how many there are in total / affected / not affected,
 * and provides filtering if the pane is open.
 **/
var SamplesToolbar = React.createClass({
    restoreSamples: function() {
        var _this = this;
        Confirm.confirm("Restore default samples selection ?").then(function() {
            SamplesActions.fetchSamples(_this.props.db);
        });
    },

    render: function () {
        var restorePopover = <Popover id='restore-samples-popover'>{"Restore default samples selection"}</Popover>;
        var summary = this.props.samples.summary();
        var selected = this.props.samples.getSelectedSamples();
        return (
            <Panel id='samples-selection-toolbar' className='summary-panel'>
            <span className="panel-title">
                <strong>Samples selection: </strong>
            </span>
            <form className="form-inline samples-summary" style={{display: 'inline'}}>
                {/* Check all samples button */}
                <span className='samples-summary'>
                    <CheckAllSamplesButton content={
                        <span>Total: <span id="n-samples" className="badge">{summary.total || '0'}</span></span>
                    } />
                </span>
                {/* Affected / not affected switch */}
                <span className='samples-summary'>
                    <FilterAffectedButtons summary={summary} />
                </span>
                {selected.length > 0 ?
                    <span className='samples-summary'>
                        <SelectionOnTop />
                    </span> : ''
                }
                {/* Male / female switch ? */}
                {/* Search bar */}
                <span className='samples-summary'>
                    <SearchBar />
                </span>
                <span className='pull-right'>
                    <OverlayTrigger placement='top' overlay={restorePopover}>
                    <Button id='restore-samples-button' bsStyle='primary' onClick={this.restoreSamples}>Restore</Button>
                    </OverlayTrigger>
                </span>
            </form>
            </Panel>
        );
    },
});


/**
 * Activate / deactivate all samples at once
 **/
var CheckAllSamplesButton = React.createClass({
    checkAll: function () {
        SamplesActions.updateAllActive();
    },
    render: function () {
        var _this = this;
        var isActive = SamplesStore.getSamplesCollection().anyActive();
        //return <span><Button className={(isActive ? 'checkbox-checked' : 'checkbox-unchecked')+' btn-sm'}
        return <Button id='check-all-samples-btn'
            value={isActive}
            name={'checkAll'}
            onClick={_this.checkAll}
        ><span>{this.props.content}</span></Button>;
    },
});


/**
 * Filter only affected/not_affected
 **/
var FilterAffectedButtons = React.createClass({
    filterAffected: function (phenotype) {
        SamplesActions.updatePhenotypeActive(phenotype);
    },
    render: function () {
        var summary = this.props.summary;
        return <ButtonGroup>
            <Button id='filter-not-affected-btn'
                onClick={this.filterAffected.bind(this, "not_affected")}
            >
                Not affected: <span id="n-not-affected" className="badge sample_group sample_group_not_affected">{summary.not_affected || '0'}</span>
            </Button>
            <Button id='filter-affected-btn'
                onClick={this.filterAffected.bind(this, "affected")}
            >
                Affected: <span id="n-affected" className="badge sample_group sample_group_affected">{summary.affected || '0'}</span>
            </Button>
        </ButtonGroup>;
    },
});


/**
 * Put selection on top of the table
 **/
var SelectionOnTop = React.createClass({
    getInitialState: function() {
        return { pushed: false, };
    },
    selectionOnTop: function(e) {
        SamplesActions.selectionOnTop(!this.state.pushed);
        $(e.currentTarget).blur();
        this.setState({ pushed: !this.state.pushed });
    },
    clearSelection: function() {
        SamplesActions.clearSelection();
        this.setState({ pushed: false });
    },
    render: function () {
        return <ButtonGroup>
            <Button active={this.state.pushed} onClick={this.selectionOnTop} >
                Bring highlighted on top
            </Button>
            <Button onClick={this.clearSelection}>
                Clear
            </Button>
        </ButtonGroup>;
    },
});


/**
 * Filter samples based on the text field content
 **/
var SearchBar = React.createClass({
    getInitialState: function () {
        return {
            success: false,
            error: false,
        };
    },
    preventDefault: function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13){  // 'Enter' key
            e.preventDefault();
            return;
        }
    },
    search: function (e) {
        SamplesActions.filterByPrefix(e.target.value);
    },
    render: function () {
        return <input className="form-control" id='samples-search-bar'
            placeholder="Search"
            type="text"
            onKeyDown={this.preventDefault}  // Otherwise hitting Enter key reloads the page
            onKeyUp={this.search}
        />;
    },
});


var VariantsSummary = React.createClass({
    getInitialState: function() {
        var isLoading = VariantStore.isLoadingVariants() || VariantStore.isLoadingNextRowBatch();
        return {
            variantStats: VariantStore.data.stats,
            isLoading: isLoading,
        };
    },
    componentDidMount: function() {
        VariantStore.addChangeListener(this._onDataChange);
    },
    componentWillUnmount: function() {
        VariantStore.removeChangeListener(this._onDataChange);
    },
    _onDataChange: function() {
        var isLoading = VariantStore.isLoadingVariants() || VariantStore.isLoadingNextRowBatch();
        this.setState({
            variantStats: VariantStore.data.stats,
            isLoading: isLoading,
        });
    },
    render: function() {
        var stats = this.state.variantStats || {};
        var count = stats.total_count ? <span id='n-variants-summary' className='badge'>{stats.total_count}</span> :
            <span className='badge'>?</span>;
        return (
            <div id='variants-summary' className='nolink'>
            <LinkToVarapp>
            <Panel className='link-hover link-panel summary-panel'>
                <span>
                    <span className="panel-title"><span className='down-right'></span>
                        <strong>Variants:</strong>
                    </span>
                    <span className='variants-summary'>
                        Total: {count}
                    </span>
                </span>
            </Panel>
            </LinkToVarapp>
            </div>
        );
    }
});


module.exports = AuthenticatedComponent(SamplesSelection);
