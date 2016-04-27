'use strict';
/**
 * Exports a list of common formatters
 */

var React = window.React = require('react');
var TextShort = require('../react/utils/TextShort');
var _ = require('lodash');
var numeral = require('numeral');
var sprintf = require('sprintf').sprintf;
var VariantActions = require('../actions/VariantActions');
var UtilsConstants = require('../constants/UtilsConstants');
var ASC = UtilsConstants.ASC;


/* A link to external service.
   id: identifier used in the service's API
   baseUrl: service's API base URL
   text: what gets displayed in the table cell
*/
var refLink = function(id, baseUrl, text) {
    return (<a className="xref-link link external" href={baseUrl + id}
              target="__VARAPP_XREF__">{text}</a>);
};

/* Round to 'sig' significant digits */
var roundSignif = function(N, sig) {
    var n = parseFloat(N);
    if (n > 1) {return sprintf('%.2f', n);}
    var sign = n > 0 ? 1 : -1;
    var mult = Math.pow(10, sig - Math.floor(Math.log(sign * n) / Math.LN10) - 1);
    if (mult === 0 || mult > 1e10) {return 0;}
    return Math.round(n * mult) / mult;
};


/**
 * Samples selection formatters
 **/

var formatSex = function (v) {
    var sex = v === 'M' ? '-man' : '-woman';
    return <div className={'samples-sex sample-sex'+ sex}></div>;
};

/**
 * Filters list formatters
 **/

var enumElem = function (v) {
    if (!v) {return '';}
    return v.replace(/_/g, ' ');
};

/**
 * Variants table cell formatters
 **/

var formatPosition = function (p) {
    return numeral(p).format('0,0');
};
var formatQuality = function (p) {
    return numeral(p).format('0.0');
};
var formatSource = function(v) {
    return <div className={'source-container'}><div className={'source source-'+v}>&nbsp;</div></div>;
};
var formatInteger = function(v) {
    if (!v) {return '';}
    return parseInt(v);
};

/* Shortened */

var formatSequence = function (seq) {
    return <TextShort text={seq} max={4}/>;
};
var formatFilter = function (passfilter) {
    return <TextShort text={passfilter} max={6}/>;
};
var formatAAChange = function(v) {
    if (!v) {return '';}
    if (v === 'p.R7TfsX21') {return v;}  // for UNK demo
    if (v.indexOf('/') < 0) {return '';}
    return <TextShort text={v} max={8}/>;
};
var formatImpact = function(v) {
    if (!v) {return '';}
    var text = enumElem(v);
    text = text.replace(/\ variant$/g, '');
    return <TextShort text={text} maxWords={3}/>;
};
var formatSiftPolyphenPreds = function(v) {
    if (!v) {return '';}
    var text = enumElem(v);
    return <TextShort text={text} maxWords={3}/>;
};

/* Links */

var formatEnsemblId = function (ensembl_id) {
    if (! ensembl_id) {return '';}
    return refLink(ensembl_id, UtilsConstants.ENSEMBL_LINK, ensembl_id);
};
var formatEntrezId = function (entrez_id) {
    if (! entrez_id) {return '';}
    return refLink(entrez_id, UtilsConstants.ENTREZ_LINK, entrez_id);
};
var formatExac = function(freq, field, v) {
    if (! freq) {return '';}
    var id = sprintf('%s-%s-%s-%s', v.chrom.replace('chr',''), v.start, v.ref, v.alt);
    return refLink(id, UtilsConstants.EXAC_LINK, formatFrequency(v.aaf_exac_all));
};

/* Lookup */

var formatRSIds = function (ids, field, variant) {
    var id;
    if (!ids || ids.length === 0) {
        return "";
    } else if (ids.length === 1) {
        id = ids[0];
        return refLink(id, UtilsConstants.DBSNP_LINK, id);
    } else {
        id = ids[0] + ',...';
        var additionalProps = {
            label: 'Dbsnp ID',
            link: UtilsConstants.DBSNP_LINK,
        };
        return <a className='lookup-link'
            onClick={VariantActions.variantLookup.bind(null, variant, field, additionalProps)}>{id}</a>;
    }
};
var formatClinVar = function (ids, field, variant) {
    var id;
    if (! ids || ids.length === 0) {
        return '';
    } else if (ids.length === 1) {
        id = ids[0];
        return refLink(id, UtilsConstants.CLINVAR_LINK, id);
    } else {
        id = ids[0] + ',...';
        var additionalProps = {
            label: 'ClinVar ID',
            link: UtilsConstants.CLINVAR_LINK,
        };
        return <a className='lookup-link'
            onClick={VariantActions.variantLookup.bind(null, variant, field, additionalProps)}>{id}</a>;
    }
};
var formatGeneSymbol = function(gene, field, variant) {
    var additionalProps = {
        ensembl_id: variant.ensembl_gene_id,
        entrez_id: variant.entrez_gene_id,
    };
    return <a className='lookup-link'
        onClick={VariantActions.variantLookup.bind(null, variant, field, additionalProps)}>{gene}</a>;
};
var formatHGVS = function(v, field, variant) {  // v: ENST00000367081.3:c.34-26A>G
    if (!v) {return '';}
    var x = v.split(':');
    var additionalProps = {
        transcript: x[0],
        position: x[1],
    };
    return <a className='lookup-link' onClick={VariantActions.variantLookup.bind(null, variant, field, additionalProps)}>
        <TextShort text={x[1]} max={12}/>
    </a>;
};


/* Round to 3 significant digits, or use exp notation if too big/too small */
var formatScientific = function(v) {
    if (v === null) {
        return '';
    } else if (v === 0) {
        return '0';
    } else if (Math.abs(v) < 1e-3 || Math.abs(v) > 1e3) {
        var sign = v > 0 ? 1 : -1;
        var exponent = Math.floor(Math.log(sign * v) / Math.LN10);
        var mult = Math.pow(10, exponent);
        var mantissa = (v / mult).toFixed(1);
        return <span>{mantissa}{'·10'}<sup>{exponent}</sup></span>;
    } else {
        return roundSignif(v, 3);
    }
};
/* Special case of the above for frequencies: -1 means no frequency */
var formatFrequency = function(v) {
    var f = parseFloat(v);
    return (!f || f === -1) ? '' : formatScientific(f);
};

/* Represent p-values as '< 10^x' if small enough. */
var formatPvalue = function(v) {
    if (v === null) {
        return '';
    } else if (v === 0) {
        return '0';
    } else if (v < 1e-5) {
        var exponent = Math.floor(Math.log(v) / Math.LN10)+1;
        return <span>{'< 10'}<sup>{exponent}</sup></span>;
    } else {
        return roundSignif(v, 5);
    }
};

/* If the number is above 1000, use thousands as unit, e.g. 2400 -> 2.4k */
var kmCount = function (v) {
    var val = parseFloat(v);
    if (val < 1000) {
        return '' + val;
    }
    return '' + Math.round(val / 1000) + 'k';
};
var roundLowScores = function (v) {
    // Used in ContinuousValueFilter, rounds to 2 significant digits
    return roundSignif(v, 2);
};
var formatFrequencyPercent = function(value){
    // Translate frequencies to short percent notation
    var val = parseFloat(value);
    if (val >= 0.01) {
        return Math.round(val*100)+'%';
    } else if (val > 0) {
        return Math.round(val*1000)+'‰';
    } else {
        return 0;
    }
};

var calculateGenotypesScalingStyle = function(nsamples, width) {
    var style = {};
    if (nsamples !== 0) {
        var padding = 5;
        var wChar = 11.751;
        var fullWidth = width - 2*padding;
        var origWidth = nsamples * wChar;
        var factor = fullWidth / (nsamples * wChar);
        if (factor > 1) {
            factor = 1;
        }
        var transformScale = 'matrix('+factor+', 0, 0, 1, '+((fullWidth-origWidth)/2)+', 0)';
        style = {transform: transformScale, paddingLeft: ''+5+'px', paddingRight: ''+5+'px' };
    }
    return style;
};

//var GIS_MAP = {'0-0':'0', '1-0':'2', '0-1':'1', '1-1':'3', '0-':'4', '-0':'4', '1-':'5', '-1':'5', '-':'.'};
var GIS_MAP = {'0-0':'0', '1-0':'1', '0-1':'2', '1-1':'3', '0-':'4', '-0':'4', '1-':'.', '-1':'.', '-':'.'};
var formatGenotypes = function(gis, activeSamples, sortBy, sortDirection) {
    var spans = _.chain(gis)
        .map(function(gi) {
            return GIS_MAP[gi.join('-')];
        })
        .zip(activeSamples)
        .sortBy(function(p) {
            var sample = p[1];
            if (sample === undefined) {        // To avoid Invariant violation error in case it changes too fast
                return null;
            }
            return sample[sortBy];
        })
        .map(function (p,j) {
            var genotype = p[0];                                        // determines the character for a glyph
            var sample = p[1];
            if (sample === undefined) {        // same as above
                return <span key={j}></span>;
            }
            var group = (genotype !== '.') ? sample.group : 'unknown';  // determines the font color
            return <span key={group+genotype+j} className={'genotype-index sample_group_'+group}>{genotype}</span>;
        })
        .value();
    if (sortDirection === ASC) {
        spans.reverse();
    }
    return spans;
};



module.exports = {
    refLink,

    kmCount,
    roundSignif,
    roundLowScores,
    formatScientific,
    formatFrequency,
    formatPvalue,
    formatFrequencyPercent,
    formatInteger,
    formatSex,
    enumElem,

    formatPosition,
    formatQuality,
    formatRSIds,
    formatGeneSymbol,
    formatSequence,
    formatFilter,
    formatEnsemblId,
    formatEntrezId,
    formatExac,
    formatClinVar,
    formatSource,
    formatAAChange,
    formatSiftPolyphenPreds,
    formatHGVS,
    formatImpact,

    calculateGenotypesScalingStyle,
    formatGenotypes,
};

