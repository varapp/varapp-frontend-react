'use strict';
var BaseStore = require('./BaseStore');

var VariantConstants = require('../constants/VariantConstants');
var LookupConstants = require('../constants/LookupConstants');
var ApiConstants = require('../constants/ApiConstants');


class LookupStore extends BaseStore {
    constructor() {
        this.init(null);
        this.subscribe(() => this._registerToActions.bind(this));
    }
    init(db) {
        this._db = db;
        this._variant = null;
        this._field = null;
        this._additionalProps = null;
        this.emitChange();
    }

    getDb() { return this._db; }
    getVariant() { return this._variant; }
    getField() { return this._field; }
    getAdditionalProps() { return this._additionalProps; }

    /* If there was one variant selected, fetch it again to be sure it is still not filtered after new samples selection
     * If it got filtered, remember it but don't show it.
     */
    updateVariant(data) {
        if (data.variants.length > 0) {
            var variant = data.variants[0];
            variant.visible = true;
            this._variant = variant;
        } else {
            this._variant.visible = false;
        }
        this.emitChange();
    }

    _registerToActions(payload) {
        switch (payload.actionType) {

            case VariantConstants.ACTION_VARIANT_LOOKUP:
                //console.log("LookupStore :: ACTION_VARIANT_LOOKUP");
                this._variant = payload.variant;
                this._field = payload.field;
                this._additionalProps = payload.additionalProps;
                this._variant.visible = true;
                this.emitChange();
                break;

            case LookupConstants.ACTION_UPDATE_LOOKUP_VARIANT:
                //console.log("LookupStore :: ACTION_UPDATE_LOOKUP_VARIANT");
                if (payload.state === ApiConstants.SUCCESS) {
                    this.updateVariant(payload.data);
                }
                break;

            default:
                return true;
        }
        return true;
    }
}


module.exports = new LookupStore();

