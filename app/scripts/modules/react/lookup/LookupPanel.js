'use strict';
var React = require('react');
var _ = require('lodash');

/* Stores */
var LookupStore = require('../../stores/LookupStore');
var FilterStore = require('../../stores/FilterStore');
var SamplesStore = require('../../stores/SamplesStore');

/* Utils */
var formatters = require('../../utils/formatters');
var Api = require('../../utils/Api');

/* Actions */
var LookupActions = require('../../actions/LookupActions');

/* Constants */
var UtilsConstants = require('../../constants/UtilsConstants');

/* React-bootstrap */
var ReactBoostrap = require('react-bootstrap');
var Panel = ReactBoostrap.Panel;
var Table = ReactBoostrap.Table;
var Glyphicon = ReactBoostrap.Glyphicon;


var LookupPanel = React.createClass({
    getInitialState: function() {
        return this._getStoreState();
    },
    componentDidMount: function() {
        SamplesStore.addChangeListener(this._onQueryChange);
        FilterStore.addChangeListener(this._onQueryChange);
        LookupStore.addChangeListener(this._onDataChange);
    },
    componentWillUnmount: function() {
        SamplesStore.removeChangeListener(this._onQueryChange);
        FilterStore.removeChangeListener(this._onQueryChange);
        LookupStore.removeChangeListener(this._onDataChange);
    },
    _getStoreState: function() {
        var variant = LookupStore.getVariant();
        return {
            variant: variant,
            isOpen: variant,
            field: LookupStore.getField(),
            additionalProps: LookupStore.getAdditionalProps(),
        };
    },
    _onDataChange: function () {
        this.setState(this._getStoreState());
    },
    _onQueryChange: function() {
        if (this.state.variant) {
            LookupActions.updateLookupVariant(Api.getDb(), Api.variantUrlArgs(), this.state.variant.variant_id);
        } else {
            this.setState({ isOpen: false });
        }
    },

    close: function() {
        this.setState({isOpen: false, variant: null});
    },

    render: function () {
        var _this = this;
        var samples = SamplesStore.getSamplesCollection().getActiveSamples();
        var variant = this.state.variant;
        var additionalProps = this.state.additionalProps;
        var field = this.state.field;
        if (! variant || ! this.state.isOpen || ! variant.visible) {
            return <div style={{dislay:'none'}}></div>;
        }
        var header = <div className='lookup-description'>
                <p><strong>{'Details '+variant.chrom+':'+variant.start+' '+variant.ref+'->'+variant.alt}</strong></p>
                <p>{variant.gene_symbol}</p>
            </div>;
        var LookupType = lookupTypes[field];
        return (
            <Panel header={header}>
                <div className='close-icon'>
                    <a role='button' onClick={_this.close}>
                        <Glyphicon glyph='remove-circle' aria-hidden="true"></Glyphicon>
                    </a>
                </div>
                <LookupType variant={variant} samples={samples} field={field} additionalProps={additionalProps}/>
            </Panel>
        );
    },
});


var GeneLookup = React.createClass({
    render: function() {
        var variant = this.props.variant;
        var field = this.props.field;
        var ensembl_id = this.props.additionalProps.ensembl_id;
        var entrez_id = this.props.additionalProps.entrez_id;
        var v = variant[field];
        return <Table condensed>
              <thead></thead>
              <tbody>
                  <tr><td>Symbol:</td><td className='lookup'>{v}</td></tr>
                  <tr><td>Ensembl:</td><td className='lookup'>{formatters.refLink(ensembl_id, UtilsConstants.ENSEMBL_LINK)}</td></tr>
                  <tr><td>Entrez:</td><td className='lookup'>{formatters.refLink(entrez_id, UtilsConstants.ENTREZ_LINK)}</td></tr>
                  <tr><td>OMIM:</td><td className='lookup'>{formatters.refLink(v, UtilsConstants.OMIM_LINK, 'Search...')}</td></tr>
              </tbody>
          </Table>;
    },
});


var ListLookup = React.createClass({
    render: function() {
        var variant = this.props.variant;
        var field = this.props.field;
        var link = this.props.additionalProps.link;
        var label = this.props.additionalProps.label;
        var lines;
        if (link) {
            lines = _.map(variant[field], function(v, i) {
                return <tr key={i}>
                    <td className='lookup'>{formatters.refLink(v, link)}</td>
                </tr>;
            });
        } else {
            lines = _.map(variant[field], function(v, i) {
                return <tr key={i}><td className='lookup'>{v}</td></tr>;
            });
        }
        return  <Table condensed>
              <thead><tr>
                  <th className='lookup-head'>{label}</th>
              </tr></thead>
              <tbody>
                  {lines}
              </tbody>
          </Table>;
    },
});


var GenotypesLookup = React.createClass({
    formatGenotype: function (genotype) {
        if (genotype) {  // TODO: Had to do that in case of too many queries and it becomes undefined
            var genmap = {'00': '0', '01': '1', '10': '2', '11': '3'};
            return genmap[genotype];
        } else {return;}
    },
    /* If only one family, return 'M' if the sample is the mother
       of some other selected samples, and 'F' if it is the father. */
    parentKind: function(sample) {
        var samples = this.props.samples;
        var parent = '';
        //if (_.uniq(_.map(samples, 'family_id')).length === 1) {
            _.map(samples, function(s) {
                if (s.father_id === sample.name) {
                    parent = 'F';
                } else if (s.mother_id === sample.name) {
                    parent = 'M';
                }
            });
        //}
        return parent;
    },
    render: function() {
        var _this = this;
        var variant = this.props.variant;
        var samples = this.props.samples;
        var genotypes = variant.genotypes_index;
        var lines = _.map(samples, function (sample, i) {
            if (!genotypes[i]) {return '';} // TODO: same as above, solve that somehow
            var genotype = genotypes[i].join('');  // [null,null].join('') returns ''
            var sexSymbol = sample.sex === 'M' ? '♂ ' : '♀ ';
            var parents = (sample.mother_id ? '♀ '+sample.mother_id+' ' : '') + (sample.father_id ? '♂ '+sample.father_id : '');
            var parentKind = _this.parentKind(sample);
            if (genotype !== '00' && genotype !== '') {
                return <tr key={i}>
                    <td className='lookup lookup-sample-name'>{sexSymbol + sample.name}</td>
                    <td className='lookup lookup-genotype'>
                        <span className={'genotype-index sample_group_'+sample.group}>
                            {_this.formatGenotype(genotype)}
                        </span>
                    </td>
                    <td className='lookup lookup-parents text-center'>{parents ? parents : parentKind}</td>
                </tr>;
            } else {
                return '';
            }
        });
        return <Table condensed>
                <thead><tr>
                    <th className='lookup-sample-name'>Name</th>
                    <th className='lookup-genotype'>Genotype</th>
                    <th className='lookup-parents text-center'>Parents</th>
                </tr></thead>
                <tbody>
                    {lines}
                </tbody>
            </Table>;
    },
});


var HgvsLookup = React.createClass({
    render: function() {
        var transcript = this.props.additionalProps.transcript;
        var position = this.props.additionalProps.position;
        var line = <tr>
            <td className='lookup'>{transcript}</td>
            <td className='lookup'>{position}</td>
            </tr>;
        return <Table condensed>
                <thead><tr>
                    <th className='lookup-hgvs-id'>Transcript</th>
                    <th className='lookup-hgvs-position'>Position</th>
                </tr></thead>
                <tbody>
                    {line}
                </tbody>
            </Table>;
    },
});


var lookupTypes = {
    'genotypes_index': GenotypesLookup,
    'dbsnp': ListLookup,
    'clinvar_disease_acc': ListLookup,
    'gene_symbol': GeneLookup,
    'hgvsc': HgvsLookup,
    'hgvsp': HgvsLookup,
    'impact': ListLookup,
};




module.exports = LookupPanel;
