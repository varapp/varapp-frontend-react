'use strict';
var React = require('react');
var _ = require('lodash');
var jQuery = require('jquery');
jQuery.noConflict();
//var igv = require('../../../../igv/igv.js')
var bamServerUrl = window.CONFIG.BAM_SERVER_URL;

var IgvStore = require('../../stores/IgvStore');
var SamplesStore = require('../../stores/SamplesStore');

var ApiConstants = require('../../constants/ApiConstants');
var UtilsConstants = require('../../constants/UtilsConstants');
var toastr = require('toastr');
toastr.options = UtilsConstants.TOASTR_OPTIONS;

var logActions = require('../../actions/LogActions');

var ReactBootstrap = require('react-bootstrap');
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;


function setOptions(location, bamUrls, trackNames) {
    var tracks = _.map(bamUrls, function(url, i) {
        var trackName = trackNames[i];
        return {
            url: url,
            indexURL: url + '.bai',
            name: trackName,
            visibilityWindow: 100000,
            alignmentRowHeight: 6,
            coverageTrackHeight: 50,
            displayMode: "SQUISHED",
        };
    });
    // Add Genes track
    tracks.unshift({
        name: "Genes",
        url: window.CONFIG.GENES_TRACK_URL,
        indexUrl: window.CONFIG.GENES_TRACK_INDEX_URL,
        displayMode: "EXPANDED",
        visibilityWindow: 100000,
    });

    return {
        showNavigation: true,
        showKaryo: false,
        genome: "hg19",
        locus: location,
        cytobandURL: undefined,
        tracks: tracks,
    };
}


/*
 * @class IgvWindow
 * @description Container for the IGV.js browser, with a Close button.
 *    Listens to IgvStore for changes in selected variant/db change.
 */
class IgvWindow extends React.Component {
    constructor() {
        super();
        this.state = {
            isOpen: false,
            options: null,
        };
        this._onVariantChange = this._onVariantChange.bind(this);
        this._close = this._close.bind(this);
    }

    componentDidMount() {
        IgvStore.addChangeListener(this._onVariantChange);
    }
    componentWillUnmount() {
        IgvStore.removeChangeListener(this._onVariantChange);
    }

    _close() {
        this.setState({
            isOpen: false,
            options: null,
        });
    }

    _onVariantChange() {
        var variant = IgvStore.getVariant();
        //console.log(2, "Variant:", variant ? variant.start : undefined)
        /* At startup, inform that the BAM service is available */
        if ((! bamServerUrl) || variant === undefined) {
            this._close();
            return;
        }
        else if (IgvStore.getStatus() === ApiConstants.SUCCESS && variant === null) {
            logActions.sendSuccess("Connected to BAM server at "+ window.CONFIG.BAM_SERVER_URL);
            return;
        }
        else if (IgvStore.getStatus() === ApiConstants.ERROR && variant === null) {
            logActions.sendWarning("Could not connect to BAM server at "+ window.CONFIG.BAM_SERVER_URL);
            this._close();
            return;
        }
        else if (IgvStore.getStatus() !== ApiConstants.SUCCESS || variant === null) {
            this._close();
            return;
        }

        var loc = variant.chrom +':'+ (variant.start-100) +'-'+ (variant.start+100);
        var samples = SamplesStore.getSamplesCollection().getActiveSamples();
        var bamSamples = _.filter(samples, 'bam');
        if (bamSamples.length === 0) {
            logActions.sendWarning("None of the selected samples has a corresponding key to a BAM file in the database.");
            return;
        }
        if (bamSamples.length > 6) {
            bamSamples = bamSamples.slice(6);
        }
        var urls = _.map(bamSamples, function(s) {
            if (s.bam) {
                return bamServerUrl +'/downloadRange/'+ s.bam +'.bam';
            }
        });
        var trackNames = _.map(bamSamples, 'name');
        var options = setOptions(loc, urls, trackNames);
        this.setState({
            options: options,
            isOpen: true,
        });
        console.log("IgvWindow :: bam urls :: ", urls);
        //console.log(3, "Samples:", samples)
        //console.log(3, "Bams:", _.map(SamplesStore.getSamplesCollection().getActiveSamples(), 'bam'))
    }

    render() {
        return (
            <Modal show={this.state.isOpen} onHide={this._close} dialogClassName='igv-modal' bsSize="large" >
                <Modal.Body>
                    <div id="igv-window" style={{position: 'relative'}}>
                        <IgvJs options={this.state.options} />
                    </div>
                </Modal.Body>
                <Modal.Footer><div style={{textAlign: 'center'}}>
                    <Button onClick={this._close} style={{display: 'inline-block'}}>Close</Button>
                </div></Modal.Footer>
            </Modal>
        );
    }
}


/*
 * @class IgvJs
 * @description The browser itself.
 */
class IgvJs extends React.Component {
    constructor() {
        super();
        this._createBrowser = this._createBrowser.bind(this);
        this._deleteBrowser = this._deleteBrowser.bind(this);
    }

    componentDidMount() {
        if (IgvStore.getStatus() === ApiConstants.SUCCESS) {
            this._createBrowser(this.props.options);
        }
    }
    componentWillUnmount() {
        this._deleteBrowser();
    }
    componentWillReceiveProps(newProps) {
        this._deleteBrowser();
        if (IgvStore.getStatus() === ApiConstants.SUCCESS) {
            this._createBrowser(newProps.options);
        }
    }

    _createBrowser(options) {
        if (options !== null) {
            var div = jQuery("#igv-browser")[0];
            window.igv.createBrowser(div, options);
        }
    }
    _deleteBrowser() {
        var div = jQuery("#igv-browser")[0];
        window.igv.removeBrowser(div);
    }
    render() {
        return <div id='igv-browser'></div>;
    }
}


module.exports = IgvWindow;
