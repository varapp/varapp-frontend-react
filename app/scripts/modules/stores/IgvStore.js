'use strict';
var BaseStore = require('./BaseStore');
var $ = require('jquery');

var VariantConstants = require('../constants/VariantConstants');
var AppConstants = require('../constants/AppConstants');
var ApiConstants = require('../constants/ApiConstants');
var SamplesConstants = require('../constants/SamplesConstants');
var FilterConstants = require('../constants/FilterConstants');
var bamServerUrl = window.CONFIG.BAM_SERVER_URL;
console.debug("Bam server URL:", bamServerUrl);


class IgvStore extends BaseStore {
    constructor() {
        this.subscribe(() => this._registerToActions.bind(this));
        this.init = this.init.bind(this);

        this._variant = null;
        this._service_status = ApiConstants.PENDING;
        this.init();
    }

    /* Makes a dummy call to the bam server to check that it is online */
    init() {
        var _this = this;
        $.ajax({
            url: bamServerUrl + '/',
            type: 'head',
            success: function () {
                _this._service_status = ApiConstants.SUCCESS;
                _this.emitChange();
            },
            error: function () {
                _this._service_status = ApiConstants.ERROR;
                _this.emitChange();
            },
        });
    }

    /* Getters */

    getVariant() {
        return this._variant;
    }
    getStatus() {
        return this._service_status;
    }

    _registerToActions(payload) {
        switch (payload.actionType) {

            case VariantConstants.ACTION_VIEW_IN_IGV:
                console.log("IgvStore :: ACTION_VIEW_IN_IGV");
                this._variant = payload.variant;
                this.emitChange();
                break;

            case AppConstants.ACTION_CHANGE_DATABASE:
            case SamplesConstants.ACTION_UPDATE_SAMPLE_ACTIVE:
            case SamplesConstants.ACTION_UPDATE_FAMILY_ACTIVE:
            case SamplesConstants.ACTION_UPDATE_ALL_ACTIVE:
            case SamplesConstants.ACTION_UPDATE_PHENOTYPE_ACTIVE:
            case FilterConstants.ACTION_UPDATE_ONE_FILTER_VALUE:
            case FilterConstants.ACTION_FILTERS_RESET:
            case AppConstants.ACTION_GOTO_BOOKMARK:
                this._variant = undefined;
                this.emitChange();
                break;

            default:
                return true;
        }
        return true;
    }
}


module.exports = new IgvStore();
