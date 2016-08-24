'use strict';
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

/* Components */
var TrueFalseAnyFilter = require('./kinds/TrueFalseAnyFilter');
var ContinuousValueFilter = require('./kinds/ContinuousValueFilter');
var EnumFilter = require('./kinds/EnumFilter');
var LocationFilter = require('./kinds/LocationFilter');
var GenotypesFilter = require('./kinds/GenotypesFilter');
var OneChoiceFilter = require('./kinds/OneChoiceFilter');
var FilterSummary = require('./FilterSummary');

/* Actions */
var FilterActions = require('../../actions/FilterActions');
var VariantActions = require('../../actions/VariantActions');

/* Stores */
var FilterStore = require('../../stores/FilterStore');

/* Constants */
var FilterConstants = require('../../constants/FilterConstants');

/* Utils */
var _ = require('lodash');
var AuthenticatedComponent = require('../login/AuthenticatedComponent');
var Api = require('../../utils/Api');

/* React-bootstrap */
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Panel = ReactBootstrap.Panel;
var Accordion = ReactBootstrap.Accordion;


/**
 * @class Filters
 * @description Build the list of filters in a filter collection, have them fire back there change
 *  to build a global filtering request.
 */

var filterClass = {};
filterClass[FilterConstants.FILTER_TYPE_CONTINUOUS] = ContinuousValueFilter;
filterClass[FilterConstants.FILTER_TYPE_FREQUENCY] = ContinuousValueFilter;
filterClass[FilterConstants.FILTER_TYPE_ENUM] = EnumFilter;
filterClass[FilterConstants.FILTER_TYPE_ONE_CHOICE] = OneChoiceFilter;
filterClass[FilterConstants.FILTER_TYPE_TRUE_FALSE_ANY] = TrueFalseAnyFilter;
filterClass[FilterConstants.FILTER_TYPE_GENOTYPES] = GenotypesFilter;

var Filters = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState: function() {
        return {
            filterByGroup: FilterStore.getFilterCollection().byGroup(),  // a list of filter groups: [{name:, filters:}, ...]
            count: FilterStore.getFilterCollection().getCounts(),
            globalStats: FilterStore.getGlobalStats(),
            openPanel: 0,
        };
    },

    componentDidMount: function() {
        FilterStore.addChangeListener(this._onDataChange);
    },
    componentWillUnmount: function() {
        FilterStore.removeChangeListener(this._onDataChange);
    },

    /* When filters change, query new variants, then update the view */
    _onDataChange: function() {
        this.setState({
            filterByGroup: FilterStore.getFilterCollection().byGroup(),
            count: FilterStore.getFilterCollection().getCounts(),
            globalStats: FilterStore.getGlobalStats(),
        });
    },
    loadVariants: function() {
        console.debug("Filters: trigger load variants");
        VariantActions.loadVariants(Api.getDb(), Api.variantUrlArgs());
        FilterStore.setFiltersChanged(false);
    },

    reset: function () {
        this.setState({
            filterByGroup: undefined,
            count: undefined,
        });
        FilterActions.filtersReset();
    },

    render: function () {
        var _this = this;
        var isReady = FilterStore.isReady();

        if (this.state.filterByGroup === undefined) {
            return <div></div>;
        }

        /* Build a list of FilterGroups */
        var groupElements = _.map(_this.state.filterByGroup, function (group, i) {
            var filters = _.map(group.filters, function (of, idx) {
                var e = React.createElement(filterClass[of.type], {
                    key: 'filter-' + group.name + '-' + idx,
                    idxFilter: idx,
                    name: of.name,
                    field: of.field,
                    stats: of.stats,
                    globalStats: of.globalStats,
                    value: of.value,
                    nullValue: of.nullValue,
                    op: of.op,
                    reverse: of.reverse,
                    type: of.type,
                    subType: of.subType
                });
                return e;
            });

            var panelHeading = <div className={'filter-group-heading-'+group.name}
                                    style={{height: '100%', width: '100%'}}>
                    <span className={'panel-toggle-prefix'} />
                    <span><strong>{group.name}</strong></span>
                </div>;
            var panelFooter = <FilterSummary filters={group.filters}/>;

            return <Panel className={'filter-group filter-group-'+group.name} header={panelHeading} eventKey={i} key={i}
                          footer={panelFooter} defaultExpanded={i === 0}>
                    {filters}
                </Panel>;
        });

        function nVariants() {
            var content = '# Variants: ';
            if (!isReady) {
                content = <span id='filter-store-not_ready'>{'...'}</span>;
            } else if (_this.state.count === undefined) {
                content = '?';
            } else {
                var filtered = _this.state.count[FilterConstants.COUNT_FILTERED];
                var total = _this.state.count[FilterConstants.COUNT_TOTAL];
                filtered = filtered === undefined ?
                    <span id='loading-local-stats'>{'...'}</span> :
                    <span id='n-filtered'>{filtered}</span>;
                total = total === undefined ? '...' : <span id='n-total'>{total}</span>;
                content = <span>{filtered} / {total}</span>;
            }
            return <span style={{overflow: "hidden", whiteSpace: "nowrap"}}># Variants: {content}</span>;
        }

        return (
            <div id="filters-form">
                <div id='filter-toolbar'>
                    <Panel key='n-variants' id='n-variants'>
                        {nVariants()}
                    </Panel>
                    <Button bsStyle='primary' id='reset-button' onClick={_this.reset}>
                        Reset
                    </Button>
                </div>
                {/* Location search box */}
                <div id='location-search'>
                    <div>
                        <LocationFilter
                            key='location-search'
                            idxFilter={1000}
                            name='Location'
                            field='location'
                            value={FilterStore.getFilter('location').value}
                            type={FilterConstants.FILTER_TYPE_AUTOCOMPLETE}
                        />
                    </div>
                </div>
                {/* Grouped filters */}
                <div className="panel-group" id="filter-group-accordion">
                    {/* Loading gif */}
                    {!isReady ?
                        <Panel bsStyle='default' className='loading-gif' id='loading-stats'>
                            Loading ...
                        </Panel> : ''}

                    {/* Collapsible panels */}
                    <Accordion defaultActiveKey={0}>
                        {groupElements}
                    </Accordion>

                </div>
            </div>
        );
    },
});


module.exports = AuthenticatedComponent(Filters);

