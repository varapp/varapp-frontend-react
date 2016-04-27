'use strict';

var React = require('react');
var Tooltip = require('react-bootstrap').Tooltip;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;


var TextShort = React.createClass({
    render: function () {
        var text = this.props.text;
        var max = this.props.max || 1000;
        var maxWords = this.props.maxWords || 1000;

        if (!text || (text.length <= max && text.split(' ').length <= maxWords)) {
            return <span className="textshort" style={{paddingLeft:'0.5em'}}>{text}</span>;
        } else {
            var todisplay = text;
            todisplay = todisplay.split(' ').slice(0, maxWords).join(' ');
            todisplay = todisplay.substr(0, max);
            todisplay = todisplay + '…';
            var tooltip = <Tooltip id={'textshort-tooltip-'+text} className='textshort-tooltip'><span>{text}</span></Tooltip>;
            return <OverlayTrigger placement='bottom' overlay={tooltip} >
                <span className="textshort" style={{paddingLeft:'0.5em'}}>{todisplay}</span>
            </OverlayTrigger>;
        }
    }
});

module.exports = TextShort;
