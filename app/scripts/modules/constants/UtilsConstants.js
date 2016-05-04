'use strict';

var ASC = 'ASC';
var DESC = 'DESC';

var TOASTR_OPTIONS = {
    closeButton: true,
    preventDuplicates: true,
    positionClass: 'toast-top-right',
    tapToDismiss : true,
};

var DBSNP_LINK = 'http://www.ncbi.nlm.nih.gov/SNP/snp_ref.cgi?rs=';
var ENSEMBL_LINK = 'http://www.ensembl.org/id/';
var ENTREZ_LINK = 'http://www.ncbi.nlm.nih.gov/gene/';
var CLINVAR_LINK = 'http://www.ncbi.nlm.nih.gov/clinvar/';
var EXAC_LINK = 'http://exac.broadinstitute.org/variant/';
var OMIM_LINK = 'http://www.omim.org/search?sort=score+desc%2C+prefix_sort+desc&search=';

module.exports = {
    ASC,
    DESC,
    TOASTR_OPTIONS,
    DBSNP_LINK,
    ENSEMBL_LINK,
    ENTREZ_LINK,
    CLINVAR_LINK,
    EXAC_LINK,
    OMIM_LINK,
};
