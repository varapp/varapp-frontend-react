'use strict';
var React = require('react');


var Footer = React.createClass({
    render: function() {
        return <div id="footer">
            <span className='footer-text footer-left'>{"Powered by "}
               <a className='external-link' href='http://gemini.readthedocs.org'>Gemini</a>{" - "}
               <a className='external-link' href='https://facebook.github.io/react/'>React</a>
            </span>
            <span className='footer-text footer-left'>{"|"}</span>
            <span className='footer-text footer-left'>
                <a href="http://varapp.vital-it.ch/docs" target="_blank">Documentation</a>
            </span>
            <span className='footer-text pull-right'>
               <a id='contact-link' target="_top"
                  href="mailto:julien.delafontaine@isb-sib.ch?Subject=Varapp contact-info-help"
                  >{"Contact"}</a>
            </span>
        </div>;
    }
});


module.exports = Footer;
