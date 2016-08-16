
var formatters = require('../../utils/formatters.js');

/**
 * Defines the columns that one can display in the variants table.
 * Schema:
 *  key: repeat of the local, frontend-only key used in COLUMN_DEF
 *  order: where it appears in the variants table
 *  label: the title that will show on top of the column
 *  width, minWidth: width of the column
 *  flexGrow: how much times faster it grows/shrinks when streched wrt other columns
 *  dataKey: the key used in the JSON we get from backend
 *  align: left-center-right, inside the column
 *  type: a category name the variable belongs to, to separate categories in the columns selection
 *  sortable: whether it is allowed to sort wrt. this column (specify if false)
 **/

var FREQ_WIDTH = 80;  // Frequencies and p-values, with scientific formatting
var SCORE_WIDTH = 80; // Numbers in reasonable ranges, such as 0:1
var INTEGER_WIDTH = 60;

var TYPES = {
    BASIC: 'Basic',
    LOCATION: 'Location',
    QUALITY: 'Quality',
    FREQUENCY: 'Frequency',
    IMPACT: 'Impact',
    PATHOGENICITY: 'Pathogenicity',
};

var COLUMN_DEF = {
    chrom: {
        key: "chrom",
        order: 1,
        label: "Chr",
        width: 50,
        minWidth: 50,
        flexGrow: 0,
        dataKey: "chrom",
        align: "left",
        type: TYPES.BASIC
    },
    start: {
        key: "start",
        order: 2,
        label: "Start",
        width: 100,
        flexGrow: 1,
        dataKey: "start",
        cellRenderer: formatters.formatPosition,
        align: "right",
        cellClassName: "number",
        type: TYPES.BASIC
    },
    end: {
        key: "end",
        order: 3,
        label: "End",
        width: 100,
        flexGrow: 1,
        dataKey: "end",
        cellRenderer: formatters.formatPosition,
        align: "right",
        cellClassName: "number",
        type: TYPES.BASIC
    },
    position: {
        key: "position",
        order: 4,
        label: "Position",
        width: 220,
        minWidth: 220,
        flexGrow: 1,
        dataKey: "position",
        align: "left",
        sortable: false,
        type: TYPES.BASIC
    },
    ref: {
        key: "ref",
        order: 5,
        label: "Ref",
        width: 60,
        flexGrow: 1,
        dataKey: "ref",
        cellRenderer: formatters.formatSequence,
        type: TYPES.BASIC
    },
    alt: {
        key: "alt",
        order: 6,
        label: "Alt",
        width: 60,
        flexGrow: 1,
        dataKey: "alt",
        cellRenderer: formatters.formatSequence,
        type: TYPES.BASIC
    },
    gene: {
        key: "gene",
        order: 7,
        label: "Gene",
        width: 85,
        minWidth: 85,
        flexGrow: 1,
        dataKey: "gene_symbol",
        cellRenderer: formatters.formatGeneSymbol,
        type: TYPES.LOCATION
    },
    ensembl_transcript_id: {
        key: "ensembl_transcript_id",
        order: 8,
        label: "Transcript Ensembl",
        width: 150,
        minWidth: 150,
        flexGrow: 1,
        dataKey: "ensembl_transcript_id",
        cellRenderer: formatters.formatEnsemblId,
        sortable: false,
        type: TYPES.LOCATION
    },
    ensembl_gene_id: {
        key: "ensembl_gene_id",
        order: 9,
        label: "Gene Ensembl",
        width: 150,
        minWidth: 150,
        flexGrow: 1,
        dataKey: "ensembl_gene_id",
        cellRenderer: formatters.formatEnsemblId,
        sortable: false,
        type: TYPES.LOCATION
    },
    entrez_gene_id: {
        key: "entrez_gene_id",
        order: 10,
        label: "Gene Entrez",
        width: 70,
        minWidth: 70,
        flexGrow: 1,
        dataKey: "entrez_gene_id",
        cellRenderer: formatters.formatEntrezId,
        sortable: false,
        type: TYPES.LOCATION
    },
    genotypes: {
        key: "genotypes",
        order: 11,
        label: "Samples genotypes",
        width: 100,
        flexGrow: 1,
        dataKey: "genotypes_index",
        isResizable: true,
        //align: 'center',
        //cellRenderer: FormatGenotypes.formatGenotypesIndex,
        sortable: false,
        type: TYPES.BASIC
    },
    source: {
        key: "source",
        order: 12,
        label: "Source",
        width: 60,
        minWidth: 60,
        flexGrow: 1,
        dataKey: "source",
        isResizable: true,
        align: "center",
        cellRenderer: formatters.formatSource,
        type: TYPES.BASIC
    },
    dbsnp: {
        key: "dbsnp",
        order: 13,
        label: "dbSNP",
        width: 110,
        minWidth: 110,
        flexGrow: 1,
        dataKey: "dbsnp",
        cellRenderer: formatters.formatRSIds,
        type: TYPES.FREQUENCY
    },
    hgvsc: {
        key: "hgvsc",
        order: 14,
        label: "HGVSc",
        width: 135,
        minWidth: 135,
        flexGrow: 1,
        dataKey: "hgvsc",
        cellRenderer: formatters.formatHGVS,
        type: TYPES.LOCATION
    },
    hgvsp: {
        key: "hgvsp",
        order: 15,
        label: "HGVSp",
        width: 135,
        minWidth: 135,
        flexGrow: 1,
        dataKey: "hgvsp",
        cellRenderer: formatters.formatHGVS,
        type: TYPES.LOCATION
    },


/** QUALITY **/


    quality: {
        key: "quality",
        order: 101,
        label: "Quality",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "quality",
        cellRenderer: formatters.formatQuality,
        align: "right",
        cellClassName: "number",
        type: TYPES.QUALITY
    },
    pass_filter: {
        key: "pass_filter",
        order: 102,
        label: "Filter",
        width: 60,
        minWidth: 60,
        flexGrow: 1,
        dataKey: "pass_filter",
        cellRenderer: formatters.formatFilter,
        type: TYPES.QUALITY
    },
    qual_depth: {
        key: "qual_depth",
        order: 103,
        label: "Quality by depth",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "qual_depth",
        cellRenderer: formatters.formatScientific,
        type: TYPES.QUALITY
    },
    fisher_strand_bias: {
        key: "fisher_strand_bias",
        order: 104,
        label: "Strand bias (FS)",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "fisher_strand_bias",
        cellRenderer: formatters.formatScientific,
        type: TYPES.QUALITY
    },
    rms_map_qual: {
        key: "rms_map_qual",
        order: 105,
        label: "RMS map qual",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "rms_map_qual",
        cellRenderer: formatters.formatScientific,
        type: TYPES.QUALITY
    },
    //gq_mean: {
    //    key: "gq_mean",
    //    order: 106,
    //    label: "Mean genotype qual",
    //    width: SCORE_WIDTH,
    //    minWidth: SCORE_WIDTH,
    //    flexGrow: 1,
    //    dataKey: "gq_mean",
    //    cellRenderer: formatters.formatScientific,
    //    type: TYPES.QUALITY,
    //},
    //gq_stdev: {
    //    key: "gq_stdev",
    //    order: 107,
    //    label: "Genotype qual SD",
    //    width: SCORE_WIDTH,
    //    minWidth: SCORE_WIDTH,
    //    flexGrow: 1,
    //    dataKey: "gq_stdev",
    //    cellRenderer: formatters.formatScientific,
    //    type: TYPES.QUALITY,
    //},
    base_qual_rank_sum: {
        key: "base_qual_rank_sum",
        order: 108,
        label: "Base qual rank sum",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "base_qual_rank_sum",
        cellRenderer: formatters.formatScientific,
        type: TYPES.QUALITY,
    },
    map_qual_rank_sum: {
        key: "map_qual_rank_sum",
        order: 109,
        label: "Map qual rank sum",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "map_qual_rank_sum",
        cellRenderer: formatters.formatScientific,
        type: TYPES.QUALITY,
    },
    read_pos_rank_sum: {
        key: "read_pos_rank_sum",
        order: 110,
        label: "Read pos rank sum",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "read_pos_rank_sum",
        cellRenderer: formatters.formatScientific,
        type: TYPES.QUALITY,
    },
    strand_bias_odds_ratio: {
        key: "strand_bias_odds_ratio",
        order: 111,
        label: "Strand bias SOR",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "strand_bias_odds_ratio",
        cellRenderer: formatters.formatScientific,
        type: TYPES.QUALITY,
    },
    //vqslod: {
    //    key: "vqslod",
    //    order: 112,
    //    label: "VQSR score",
    //    width: SCORE_WIDTH,
    //    minWidth: SCORE_WIDTH,
    //    flexGrow: 1,
    //    dataKey: "vqslod",
    //    cellRenderer: formatters.formatScientific,
    //    type: TYPES.QUALITY,
    //},
    read_depth: {
        key: "read_depth",
        order: 113,
        label: "Read depth",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "read_depth",
        cellRenderer: formatters.formatInteger,
        type: TYPES.QUALITY,
    },


/** IMPACT **/


    aa_change: {
        key: "aa_change",
        order: 201,
        label: "AA change",
        width: 100,
        flexGrow: 1,
        dataKey: "aa_change",
        cellRenderer: formatters.formatAAChange,
        type: TYPES.IMPACT
    },
    impact: {
        key: "impact",
        order: 202,
        label: "Impact",
        width: 120,
        minWidth: 120,
        flexGrow: 1,
        dataKey: "impact",
        cellRenderer: formatters.formatImpact,
        type: TYPES.IMPACT
    },
    impact_severity: {
        key: "impact_severity",
        order: 203,
        label: "Impact severity",
        width: 80,
        minWidth: 120,
        flexGrow: 1,
        dataKey: "impact_severity",
        align: "center",
        cellRenderer: formatters.formatImpact,
        type: TYPES.IMPACT
    },


/** FREQUENCY **/


    aaf_1kg_all: {
        key: "aaf_1kg_all",
        order: 301,
        label: "1KG frequency",
        width: FREQ_WIDTH,
        minWidth: FREQ_WIDTH,
        flexGrow: 1,
        dataKey: "aaf_1kg_all",
        cellRenderer: formatters.formatFrequency,
        type: TYPES.FREQUENCY
    },
    aaf_esp_all: {
        key: "aaf_esp_all",
        order: 302,
        label: "ESP frequency",
        width: FREQ_WIDTH,
        minWidth: FREQ_WIDTH,
        flexGrow: 1,
        dataKey: "aaf_esp_all",
        cellRenderer: formatters.formatFrequency,
        type: TYPES.FREQUENCY
    },
    aaf_exac_all: {
        key: "aaf_exac_all",
        order: 303,
        label: "Exac frequency",
        width: FREQ_WIDTH,
        minWidth: FREQ_WIDTH,
        flexGrow: 1,
        dataKey: "aaf_exac_all",
        cellRenderer: formatters.formatExac,
        type: TYPES.FREQUENCY
    },
    aaf_max_all: {
        key: "aaf_max_all",
        order: 304,
        label: "Max frequency",
        width: FREQ_WIDTH,
        minWidth: FREQ_WIDTH,
        flexGrow: 1,
        dataKey: "aaf_max_all",
        cellRenderer: formatters.formatFrequency,
        type: TYPES.FREQUENCY
    },
    allele_freq: {
        key: "allele_freq",
        order: 305,
        label: "Allele frequency",
        width: FREQ_WIDTH,
        minWidth: FREQ_WIDTH,
        flexGrow: 1,
        dataKey: "allele_freq",
        cellRenderer: formatters.formatScientific,
        type: TYPES.FREQUENCY
    },
    allele_count: {
        key: "allele_count",
        order: 306,
        label: "Allele count",
        width: INTEGER_WIDTH,
        minWidth: INTEGER_WIDTH,
        flexGrow: 1,
        dataKey: "allele_count",
        cellRenderer: formatters.formatInteger,
        type: TYPES.FREQUENCY
    },


/** PATHOGENICITY **/


    cadd_raw: {
        key: "cadd_raw",
        order: 401,
        label: "Raw CADD score",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "cadd_raw",
        type: TYPES.PATHOGENICITY
    },
    cadd_scaled: {
        key: "cadd_scaled",
        order: 402,
        label: "Scaled CADD score",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "cadd_scaled",
        type: TYPES.PATHOGENICITY
    },
    clinvar_sig: {
        key: "clinvar_sig",
        order: 403,
        label: "Clinvar sig",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "clinvar_sig",
        type: TYPES.PATHOGENICITY
    },
    clinvar_disease_acc: {
        key: "clinvar_disease_acc",
        order: 404,
        label: "Clinvar disease acc.",
        width: 140,
        flexGrow: 1,
        dataKey: "clinvar_disease_acc",
        cellRenderer: formatters.formatClinVar,
        type: TYPES.PATHOGENICITY
    },
    gerp_bp_score: {
        key: "gerp_bp_score",
        order: 405,
        label: "GERP score",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "gerp_bp_score",
        cellRenderer: formatters.formatScientific,
        type: TYPES.PATHOGENICITY
    },
    gerp_element_pval: {
        key: "gerp_element_pval",
        order: 406,
        label: "GERP p-value",
        width: FREQ_WIDTH,
        minWidth: FREQ_WIDTH,
        flexGrow: 1,
        dataKey: "gerp_element_pval",
        cellRenderer: formatters.formatPvalue,
        type: TYPES.PATHOGENICITY
    },
    polyphen_pred: {
        key: "polyphen_pred",
        order: 407,
        label: "Polyphen pred",
        width: 160,
        flexGrow: 1,
        dataKey: "polyphen_pred",
        cellRenderer: formatters.formatSiftPolyphenPreds,
        type: TYPES.PATHOGENICITY
    },
    polyphen_score: {
        key: "polyphen_score",
        order: 408,
        label: "Polyphen score",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "polyphen_score",
        cellRenderer: formatters.formatPvalue,
        type: TYPES.PATHOGENICITY
    },
    sift_pred: {
        key: "sift_pred",
        order: 409,
        label: "SIFT pred",
        width: 160,
        flexGrow: 1,
        dataKey: "sift_pred",
        cellRenderer: formatters.formatSiftPolyphenPreds,
        type: TYPES.PATHOGENICITY
    },
    sift_score: {
        key: "sift_score",
        order: 410,
        label: "SIFT score",
        width: SCORE_WIDTH,
        minWidth: SCORE_WIDTH,
        flexGrow: 1,
        dataKey: "sift_score",
        cellRenderer: formatters.formatScientific,
        type: TYPES.PATHOGENICITY
    },
};

module.exports = {
    COLUMN_DEF: COLUMN_DEF,
};
