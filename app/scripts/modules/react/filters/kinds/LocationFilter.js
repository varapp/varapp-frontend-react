'use strict';
var React = require('react');
var FilterActions = require('../../../actions/FilterActions');
var FilterStore = require('../../../stores/FilterStore');

var ReactBoostrap = require('react-bootstrap');
var Input = ReactBoostrap.FormControl;
var InputGroup = ReactBoostrap.InputGroup;
var FormGroup = ReactBoostrap.FormGroup;
var Glyphicon = ReactBoostrap.Glyphicon;
var Button = ReactBoostrap.Button;
var ButtonGroup = ReactBoostrap.ButtonGroup;


/**
 * @class LocationFilter
 **/

var LocationFilter = React.createClass({
    getInitialState: function () {
        //this.reRangeChr = /\s*chr\w*:?$/;
        //this.reRangeOneBound = /\s*chr\w+:[\d,]+$/i;
        //this.reRangeFull = /\s*chr\w+:[\d,]+\-[\d,]+\s*/i;
        return {
            text: '',
            success: false,
            error: false,
            areaVisible: false,
        };
    },

    /* Make sure that the text entered contains only the expected charset (,:- ) */
    checkFormat: function(val) {
        var valid = (/^[a-zA-Z0-9-,: ]*$/).test(val);
        if (! valid) {
            this.setState({success: false, error: true});
        }
        return valid;
    },

    onTextChange: function(e) {
        var text = e.target.value;
        this.setState({ text: text.split(/[,\n\r]/) });
    },

    search: function (e) {
        var _this = this;
        var val = this.state.text ? this.state.text.join(',') : '';
        // On Enter pressed, return. Proceed otherwise.
        if (e.type === 'keypress') {
            var keyCode = e.keyCode || e.which;
            if (keyCode !== 13){  // 'Enter' key
                return;
            }
        }
        if (val === '') {
            FilterActions.updateOneFilterValue(this.props.field, undefined);
            this.setState({
                error: false,
                success: false,
                text: '',
            });
        }
        else if (this.checkFormat(val)) {
            /* Trigger a filter change based on response to a /location request */
            var db = FilterStore.getDb();
            FilterActions.findLocation(db, val).then(
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
        }
    },

    toggleSearchArea: function() {
        this.setState({ areaVisible: !this.state.areaVisible });
    },

    render: function() {
        var text;
        var isLoading = FilterStore.locationChanged();
        var loadingGif = <div className='loading-gif' style={{width: '40px', height: '32px', padding: 0}}></div>;
        var searchButton = <Button className='location-search-button' onClick={this.search}>
                    <Glyphicon glyph='search'/></Button>;
        var toggleButtonVertical = <Button className='toggle-vertical-button' onClick={this.toggleSearchArea}>
                    <Glyphicon glyph='option-horizontal'/></Button>;
        var toggleButtonHorizontal = <Button className='toggle-horizontal-button' onClick={this.toggleSearchArea}>
                    <Glyphicon glyph='option-vertical'/></Button>;
        if (this.state.areaVisible) {

            /* Text area */

            text = this.state.text ? this.state.text.join('\n') : '';
            return (
                <FormGroup validationState={this.state.success ? 'success' : (this.state.error ? 'error' : null)}>
                    <InputGroup style={{width:'100%'}}>
                        <Input
                            componentClass="textarea"
                            className='location-search-area'
                            rows="10"
                            placeholder="(One location per line)"
                            onChange={this.onTextChange}
                            value={text}
                        />
                        <div className='btn-group-positioner'>
                            <ButtonGroup>
                                {searchButton}
                                {toggleButtonHorizontal}
                            </ButtonGroup>
                        </div>
                    </InputGroup>
                </FormGroup>
            );
        } else {

            /* Simple input */

            text = this.state.text ? this.state.text.join(',') : '';
            return (
                <FormGroup validationState={this.state.success ? 'success' : (this.state.error ? 'error' : null)}>
                    <InputGroup>
                        <Input
                            className="location-search"
                            label={this.state.error ? 'Invalid location string: '+this.state.text : ''}
                            type="text"
                            placeholder={this.props.value || "Location: geneA,geneB or chr1:123-456"}
                            onKeyPress={this.search}
                            onChange={this.onTextChange}
                            value={text}
                        />
                        <InputGroup.Addon style={{padding:'0', margin:'0'}}>
                            {isLoading ? loadingGif : toggleButtonVertical}
                        </InputGroup.Addon>
                    </InputGroup>
                </FormGroup>
            );
        }
    },
});

module.exports = LocationFilter;

