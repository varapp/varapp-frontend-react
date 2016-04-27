
var FilterConstants = require('../../constants/FilterConstants');

var GENOTYPE_GROUP = "Scenario";
var FREQUENCY_GROUP = "Frequency";
var QUALITY_GROUP = "Quality";
var LOCATION_GROUP = "Location";
var IMPACT_GROUP = "Impact";
var PATHOGENICITY_GROUP = "Pathogenicity";

var filter_groups = [GENOTYPE_GROUP, FREQUENCY_GROUP, QUALITY_GROUP, IMPACT_GROUP, PATHOGENICITY_GROUP];

var filters = [

    /**
     * Schema :
     * {
     *    group: the filters group it belongs to,
     *    name: the name displayed on screen, inside the Filters box,
     *    field: the key of the corresponding column in the variants json,
     *    type: filter type - may be an enum, continuous, etc.,
     *    op: for continuous numeric filters, the r'<>=' symbol,
     *    reverse: for numeric filters, whether it should start with the maximum value,
     *    nullValue: value for which the filter is ignored (e.g. 0 for quality),
     *        for when it is not defined in the filter type itself.
     *        It corresponds to not including the filter in HTTP requests.
     *    invisibleValue: value that triggers a filter but will not be displayed in the summary.
     **/

// Location

    {
        group: LOCATION_GROUP,
        name: 'location',
        field: 'location',
        type: FilterConstants.FILTER_TYPE_AUTOCOMPLETE
    },

// Impact

    {
        group: IMPACT_GROUP,
        name: 'Coding',
        field: 'is_coding',
        type: FilterConstants.FILTER_TYPE_TRUE_FALSE_ANY
    },
    {
        group: IMPACT_GROUP,
        name: 'Exonic',
        field: 'is_exonic',
        type: FilterConstants.FILTER_TYPE_TRUE_FALSE_ANY
    },
    {
        group: IMPACT_GROUP,
        name: 'Impact',
        field: 'impact',
        type: FilterConstants.FILTER_TYPE_ENUM
    },

// Quality

    {
        group: QUALITY_GROUP,
        name: 'Quality filter',
        field: 'pass_filter',
        type: FilterConstants.FILTER_TYPE_ENUM
    },
    {
        group: QUALITY_GROUP,
        name: 'Quality score',
        field: 'quality',
        op: '>=',
        reverse: false,
        nullValue: 0,
        type: FilterConstants.FILTER_TYPE_CONTINUOUS,
    },
    {
        group: QUALITY_GROUP,
        name: 'Quality by depth',
        field: 'qual_depth',
        op: '>=',
        type: FilterConstants.FILTER_TYPE_CONTINUOUS,
    },
    {
        group: QUALITY_GROUP,
        name: 'RMS mapping quality',
        field: 'rms_map_qual',
        op: '>=',
        type: FilterConstants.FILTER_TYPE_CONTINUOUS,
    },
    {
        group: QUALITY_GROUP,
        name: 'Base qual rank sum',
        field: 'base_qual_rank_sum',
        op: '>=',
        type: FilterConstants.FILTER_TYPE_CONTINUOUS,
    },
    {
        group: QUALITY_GROUP,
        name: 'Map qual rank sum',
        field: 'map_qual_rank_sum',
        op: '>=',
        type: FilterConstants.FILTER_TYPE_CONTINUOUS,
    },
    {
        group: QUALITY_GROUP,
        name: 'Read pos rank sum',
        field: 'read_pos_rank_sum',
        op: '>=',
        type: FilterConstants.FILTER_TYPE_CONTINUOUS,
    },
    {
        group: QUALITY_GROUP,
        name: 'Strand bias (FS)',
        field: 'fisher_strand_bias',
        op: '<=',
        reverse: true,
        type: FilterConstants.FILTER_TYPE_CONTINUOUS,
    },
    {
        group: QUALITY_GROUP,
        name: 'Strand bias SOR',
        field: 'strand_bias_odds_ratio',
        op: '<=',
        reverse: true,
        type: FilterConstants.FILTER_TYPE_CONTINUOUS,
    },

// Genotype

    {
        group: GENOTYPE_GROUP,
        name: 'Scenario',
        field: 'genotype',
        invisibleValue: 'active',
        type: FilterConstants.FILTER_TYPE_GENOTYPES
    },

// Frequency

    {
        group: FREQUENCY_GROUP,
        name: 'In dbsnp',
        field: 'in_dbsnp',
        type: FilterConstants.FILTER_TYPE_TRUE_FALSE_ANY
    },
    {
        group: FREQUENCY_GROUP,
        name: 'In 1k genome',
        field: 'in_1kg',
        type: FilterConstants.FILTER_TYPE_TRUE_FALSE_ANY
    },
    {
        group: FREQUENCY_GROUP,
        name: 'In EXAC',
        field: 'in_exac',
        type: FilterConstants.FILTER_TYPE_TRUE_FALSE_ANY
    },
    {
        group: FREQUENCY_GROUP,
        name: 'In ESP',
        field: 'in_esp',
        type: FilterConstants.FILTER_TYPE_TRUE_FALSE_ANY
    },
    {
        group: FREQUENCY_GROUP,
        name: '1000G frequency',
        field: 'aaf_1kg_all',
        op: '<=',
        reverse: true,
        type: FilterConstants.FILTER_TYPE_FREQUENCY,
    },
    {
        group: FREQUENCY_GROUP,
        name: 'ESP frequency',
        field: 'aaf_esp_all',
        op: '<=',
        reverse: true,
        type: FilterConstants.FILTER_TYPE_FREQUENCY,
    },
    {
        group: FREQUENCY_GROUP,
        name: 'EXAC frequency',
        field: 'aaf_exac_all',
        op: '<=',
        reverse: true,
        type: FilterConstants.FILTER_TYPE_FREQUENCY,
    },
    {
        group: FREQUENCY_GROUP,
        name: 'Max frequency',
        field: 'aaf_max_all',
        op: '<=',
        reverse: true,
        type: FilterConstants.FILTER_TYPE_FREQUENCY,
    },

// Pathogenicity

    {
        group: PATHOGENICITY_GROUP,
        name: 'Polyphen pred',
        field: 'polyphen_pred',
        type: FilterConstants.FILTER_TYPE_ENUM,
    },
    {
        group: PATHOGENICITY_GROUP,
        name: 'Sift pred',
        field: 'sift_pred',
        type: FilterConstants.FILTER_TYPE_ENUM,
    },
    {
        group: PATHOGENICITY_GROUP,
        name: 'Polyphen score',
        field: 'polyphen_score',
        op: '>=',
        reverse: false,
        type: FilterConstants.FILTER_TYPE_FREQUENCY,
    },
    {
        group: PATHOGENICITY_GROUP,
        name: 'Sift score',
        field: 'sift_score',
        op: '<=',
        reverse: true,
        type: FilterConstants.FILTER_TYPE_FREQUENCY,
    },
    //{
    //    group: PATHOGENICITY_GROUP,
    //    name: 'GERP p-value',
    //    field: 'gerp_element_pval',
    //    op: '<=',
    //    reverse: true,
    //    type: FilterConstants.FILTER_TYPE_FREQUENCY,
    //},
    {
        group: PATHOGENICITY_GROUP,
        name: 'GERP score',
        field: 'gerp_bp_score',
        op: '>=',
        type: FilterConstants.FILTER_TYPE_CONTINUOUS
    },
    {
        group: PATHOGENICITY_GROUP,
        name: 'CADD (raw)',
        field: 'cadd_raw',
        op: '>=',
        type: FilterConstants.FILTER_TYPE_CONTINUOUS
    },
    {
        group: PATHOGENICITY_GROUP,
        name: 'CADD (scaled)',
        field: 'cadd_scaled',
        op: '>=',
        type: FilterConstants.FILTER_TYPE_CONTINUOUS
    },
];


module.exports = {
    filters: filters,
    filter_groups: filter_groups,
};
