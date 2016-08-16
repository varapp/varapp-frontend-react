'use strict';
var React = window.React = require('react');
var toastr = require('toastr');

/* Stores */
var VariantStore = require('../../stores/VariantStore');

var AppActions = require('../../actions/AppActions');
var LoginActions = require('../../actions/LoginActions');
var Api = require('../../utils/Api');

/* Components */
var AuthenticatedComponent = require('../login/AuthenticatedComponent');
var VariantsTable = require('./VariantsTable.js');
var ColumnsSelection = require('./ColumnsSelection');
var Bookmarks = require('./Bookmarks');
var ExportTo = require('./ExportTo');
var IgvWindow = require('../igv/IgvWindow');

/* Constants */
var UtilsConstants = require('../../constants/UtilsConstants');


/**
 * @class Variants
 * @description fixed-data-table to display variants, with its menu and controllers
 * It is where the URL change is triggered, on data change.
 */

toastr.options = UtilsConstants.TOASTR_OPTIONS;

/**
 * The container, with the menu buttons and the table below
 **/
var Variants = React.createClass({
    getInitialState: function () {
        return this._stateFromStore();
    },
    componentWillMount: function() {
        this._onDataChange();
    },
    componentDidMount: function() {
        VariantStore.addChangeListener(this._onDataChange);
        this._changeUrl();
    },
    componentWillUnmount: function() {
        VariantStore.removeChangeListener(this._onDataChange);
    },

    _stateFromStore: function() {
        return {
            variants: VariantStore.getVariants(),
            selectedColumns: VariantStore.getColumns(),
            isLoading: VariantStore.isLoadingVariants(),
            isLoadingNextRowBatch: VariantStore.isLoadingNextRowBatch(),
            isExporting: VariantStore.isExporting(),
        };
    },
    _changeUrl: function() {
        var newQuery = Api.buildQueryDict();
        if (newQuery) {
            AppActions.changeUrl(newQuery);
        }
    },
    _onDataChange: function () {
        /* Update the URL */
        this._changeUrl();
        /* Reset the JWT expiration time */
        if (VariantStore.isLoadingVariants()) {
            LoginActions.renewSession();
        }
        /* Update the view */
        var columns = VariantStore.getColumns();
        if (VariantStore.isCompound()) {
            columns.source = true;
        } else {
            delete columns.source;
        }
        var state = this._stateFromStore();
        state.selectedColumns = columns;
        this.setState( state );
    },

    render: function () {
        var db = VariantStore.getDb();
        return (
            <div id="variants-table">
                <div className="toolbar variants-toolbar">
                    <ColumnsSelection selectedColumns={this.state.selectedColumns} />
                    <ExportTo selectedColumns={this.state.selectedColumns} isExporting={this.state.isExporting} />
                    <Bookmarks db={db} />
                    <p id="lineNr" style={{'float':'right'}} />
                </div>
                <VariantsTable
                    variants={this.state.variants}
                    selectedColumns={this.state.selectedColumns}
                    isLoading={this.state.isLoading}
                    isLoadingNextRowBatch={this.state.isLoadingNextRowBatch}
                />
                <IgvWindow />
            </div>
        );
    },
});


module.exports = AuthenticatedComponent(Variants);


