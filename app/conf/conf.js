/*
 * Configuration
 * REST calls to query samples, variants, etc. will use `BACKEND_URL`.
 * Igv.js will use `BAM_SERVER_URL` to fetch the alignment files.
 */

window.CONFIG = {
    /* Server URL, typically : window.location.protocol + '//' + window.location.hostname + "/backend" */
    BACKEND_URL: 'http://localhost:8000/varapp',

    /* BAM server URL, typically : window.location.protocol + '//' + window.location.hostname + "/bamserver"  */
    BAM_SERVER_URL: 'http://localhost:9000',

    /* IGV.js. Better change these for locally served files to improve loading times in the IGV window. */
    GENES_TRACK_URL: 'https://s3.amazonaws.com/igv.broadinstitute.org/data/hg38/gencode.v24.annotation.sorted.gtf.gz',
    GENES_TRACK_INDEX_URL: 'https://s3.amazonaws.com/igv.broadinstitute.org/data/hg38/gencode.v24.annotation.sorted.gtf.gz.tbi',

}
