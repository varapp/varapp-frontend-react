'use strict';
var dispatcher = require('../dispatcher/Dispatcher');
var VariantConstants = require('../constants/VariantConstants');
var ApiConstants = require('../constants/ApiConstants');
var RestService = require('../utils/RestService');
var ROW_BATCH_SIZE = VariantConstants.ROW_BATCH_SIZE;

var VariantActions = {

    /* Async */

    loadVariants: function(db, variantUrlArgs) {
        //console.log("ACTION load variants")
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_FETCH_VARIANTS,
            state: ApiConstants.PENDING,
        });
        RestService.getVariants(db, ROW_BATCH_SIZE, variantUrlArgs)
            .then(function(data) {
                dispatcher.dispatch({
                    actionType: VariantConstants.ACTION_FETCH_VARIANTS,
                    state: ApiConstants.SUCCESS,
                    data: data,
                });
            })
            .fail(function(error) {
                dispatcher.dispatch({
                    actionType: VariantConstants.ACTION_FETCH_VARIANTS,
                    state: ApiConstants.ERROR,
                    error: error,
                });
            });
    },

    loadNextRowBatch: function(db, offset, variantUrlArgs) {
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_LOAD_NEXT_ROW_BATCH,
            state: ApiConstants.PENDING,
        });
        RestService.getNextVariants(db, ROW_BATCH_SIZE, offset, variantUrlArgs)
            .then(function (data) {
                dispatcher.dispatch({
                    actionType: VariantConstants.ACTION_LOAD_NEXT_ROW_BATCH,
                    state: ApiConstants.SUCCESS,
                    data: data,
                });
            })
            .fail(function(error) {
                dispatcher.dispatch({
                    actionType: VariantConstants.ACTION_LOAD_NEXT_ROW_BATCH,
                    state: ApiConstants.ERROR,
                    error: error,
                });
            });
    },

    export: function(db, format, fields, variantUrlArgs) {
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_EXPORT_VARIANTS,
            state: ApiConstants.PENDING,
        });
        RestService.export(db, format, fields, variantUrlArgs)
            .then(function () {
                dispatcher.dispatch({
                    actionType: VariantConstants.ACTION_EXPORT_VARIANTS,
                    state: ApiConstants.SUCCESS,
                });
            })
            .fail(function(error) {
                dispatcher.dispatch({
                    actionType: VariantConstants.ACTION_EXPORT_VARIANTS,
                    state: ApiConstants.ERROR,
                    error: error,
                });
            });
    },

    fetchBookmarks: function(db) {
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_FETCH_BOOKMARKS,
            state: ApiConstants.PENDING,
        });
        RestService.getBookmarks(db)
            .then(function(data) {
                dispatcher.dispatch({
                    actionType: VariantConstants.ACTION_FETCH_BOOKMARKS,
                    state: ApiConstants.SUCCESS,
                    bookmarks: data,
                });
            })
            .fail(function(error) {
                dispatcher.dispatch({
                    actionType: VariantConstants.ACTION_FETCH_BOOKMARKS,
                    state: ApiConstants.ERROR,
                    error: error,
                });
            });
    },

    /* Sync */

    selectVariant: function(selectedVariants, genotypes) {
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_SELECT_VARIANT,
            selectedVariants: selectedVariants,
            genotypes: genotypes,
        });
    },
    variantLookup: function(variant, field, additionalProps) {
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_VARIANT_LOOKUP,
            variant: variant,
            field: field,
            additionalProps: additionalProps,
        });
    },
    addOrRemoveColumn: function(field, add) {
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_ADD_OR_REMOVE_COLUMN,
            field: field,
            add: add,
        });
    },
    bookmarksChanged: function() {
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_BOOKMARKS_CHANGED,
        });
    },
    sortVariants: function(sortBy, sortDirection) {
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_SORT_VARIANTS,
            sortBy: sortBy,
            sortDirection: sortDirection,
        });
    },
    viewInIgv: function(variant) {
        dispatcher.dispatch({
            actionType: VariantConstants.ACTION_VIEW_IN_IGV,
            variant: variant,
        });

    },
};

module.exports = VariantActions;
