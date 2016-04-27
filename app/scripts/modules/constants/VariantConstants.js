'use strict';
var keyMirror = require('keymirror');
var _ = require('lodash');


var mirrored = keyMirror({
    ACTION_FETCH_VARIANTS: null,
    ACTION_LOAD_NEXT_ROW_BATCH: null,

    ACTION_SORT_VARIANTS: null,
    ACTION_VARIANT_LOOKUP: null,
    ACTION_ADD_OR_REMOVE_COLUMN: null,
    ACTION_BOOKMARKS_CHANGED: null,
    ACTION_FETCH_BOOKMARKS: null,
    ACTION_EXPORT_VARIANTS: null,

    ACTION_SEND_STATS: null,
    ACTION_SELECT_VARIANT: null,
    ACTION_FILTER_ONLY_SELECTED: null,
    ACTION_SEND_SELECTED_VARIANTS: null,
});

var constants = {
    ROW_BATCH_SIZE: 300,
    DEFAULT_COLS: ['chrom', 'start', 'ref', 'alt', 'gene', 'entrez_gene_id', 'genotypes', 'dbsnp', 'aa_change'],
    ROW_HEIGHT: 38,
    HEADER_HEIGHT: 50,
};


module.exports = _.extend(mirrored, constants);
