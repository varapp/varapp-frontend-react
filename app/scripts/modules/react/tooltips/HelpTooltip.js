'use strict';

var React = require('react');
var descriptions = require('./HelpTooltipDescriptions');

var ReactBootstrap = require('react-bootstrap');
var Popover = ReactBootstrap.Popover;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Glyphicon = ReactBootstrap.Glyphicon;


/* A question mark glyphicon that shows help on mouse over */
var HelpTooltip = React.createClass({
    render: function () {
        var name = this.props.name;   // the field name in HelpTooltipDescriptions
        var category = this.props.category;  // the category in HelpTooltipDescriptions
        var placement = this.props.placement || 'right';
        if ((category in descriptions) && (name in descriptions[category])) {
            var description = descriptions[category][name];
            var tooltip = <Popover id='help-tooltip-overlay'>{description}</Popover>;
            return <OverlayTrigger placement={placement} overlay={tooltip}>
                <span className='help-tooltip pointme'><Glyphicon glyph='question-sign' /></span>
            </OverlayTrigger>;
        } else {
            return <span></span>;
        }
    }
});


/* A component wrapping some text to show help on mouse over */
var WithHelper = React.createClass({
    render: function () {
        var content = this.props.content;
        var name = this.props.name;   // the field name in HelpTooltipDescriptions
        var category = this.props.category;  // the category in HelpTooltipDescriptions
        var placement = this.props.placement || 'bottom';
        if ((category in descriptions) && (name in descriptions[category])) {
            var description = descriptions[category][name];
            var tooltip = <Popover id='help-tooltip-overlay'>{description}</Popover>;
            return (<OverlayTrigger placement={placement} overlay={tooltip}>
                    <span className='pointme'>
                        {content}
                    </span>
                </OverlayTrigger>);
        } else {
            return <span></span>;
        }
    }
});


module.exports = {
    HelpTooltip,
    WithHelper,
};
