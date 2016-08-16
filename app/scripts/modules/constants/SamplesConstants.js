'use strict';

var keyMirror = require('keymirror');

module.exports = keyMirror({
    ACTION_FETCH_SAMPLES: null,
    ACTION_UPDATE_SAMPLE_GROUP: null,
    ACTION_UPDATE_SAMPLE_ACTIVE: null,
    ACTION_UPDATE_PHENOTYPE_ACTIVE: null,
    ACTION_UPDATE_FAMILY_ACTIVE: null,
    ACTION_UPDATE_ALL_ACTIVE: null,
    ACTION_FILTER_AFFECTED: null,
    ACTION_FILTER_PREFIX: null,

    ACTION_SORT_SAMPLES: null,
    ACTION_SELECT_SAMPLE: null,
    ACTION_SELECTION_ON_TOP: null,
    ACTION_CLEAR_SELECTION: null,
});
