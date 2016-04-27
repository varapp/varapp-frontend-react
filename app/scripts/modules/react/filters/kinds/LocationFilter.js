'use strict';
var React = require('react');
var FilterActions = require('../../../actions/FilterActions');
var FilterStore = require('../../../stores/FilterStore');
var restClient = require('../../../utils/RestClientService');
var LinkedStateMixin = require('react-addons-linked-state-mixin');

var ReactBoostrap = require('react-bootstrap');
var Input = ReactBoostrap.Input;
var Glyphicon = ReactBoostrap.Glyphicon;
var Button = ReactBoostrap.Button;


/**
 * @class LocationFilter
 **/

var LocationFilter = React.createClass({
    mixins: [LinkedStateMixin],

    getInitialState: function () {
        var _this = this;
        this._refKey = 'acf-' + _this.props.key;
        this.reRangechr = /\s*chr\w*:?$/;
        this.reRangeOneBound = /\s*chr\w+:[\d,]+$/i;
        this.reRangeFull = /\s*chr\w+:[\d,]+\-[\d,]+\s*/i;
        return {
            text: '',
            success: false,
            error: false,
        };
    },

    search: function (e) {
        // On Enter pressed, return. Proceed otherwise.
        if (e.type === 'keypress') {
            var keyCode = e.keyCode || e.which;
            if (keyCode !== 13){  // 'Enter' key
                return;
            }
        }
        var _this = this;
        var val = e.target.value;
        if (val === '') {
            FilterActions.updateOneFilterValue(_this.props.field, undefined);
            this.setState(this.getInitialState());
            return;
        }
        if (!(/^[a-zA-Z0-9-,: ]*$/).test(val)) {
            this.setState({success: false, error: true});
            return;
        }
        var db = FilterStore.getDb();
        restClient.get('/'+db+'/location/' + val).then(
            function (data) {
                FilterActions.updateOneFilterValue(_this.props.field, val);
                if (data.length > 0) {
                    _this.setState({success: true, error: false});
                } else {
                    _this.setState({success: false, error: false});
                }
            }, function () {
                FilterActions.updateOneFilterValue(_this.props.field, undefined);
                _this.setState({success: false, error: true});
            }
        );
    },

    render: function () {
        var _this = this;
        var innerButton = <Button><Glyphicon glyph='search' /></Button>;
        return (
            <Input
                className={"location-search typeahead"}
                bsStyle={this.state.success ? 'success' : (this.state.error?'error':null)}
                label={this.state.error ? 'Invalid location string: '+this.state.text : ''}
                type="text"
                placeholder={this.props.value || "Location: geneA,geneB or chr1:123-456"}
                onKeyPress={_this.search}
                onBlur={_this.search}
                buttonAfter={innerButton}
                valueLink={this.linkState('text')}
            />
        );
    },
});

module.exports = LocationFilter;

