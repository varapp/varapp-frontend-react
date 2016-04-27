var React = require('react');
var ReactDOM = require('react-dom');
var ReactBoostrap = require('react-bootstrap');
var Modal = ReactBoostrap.Modal;
var Button = ReactBoostrap.Button;
var $ = require('jquery');


/**
 *  A confirmation window. Basically a ReactBootstrap Modal.
 * The 'Ok' button will resolve the promise ($.Deferred object);
 * The 'Cancel' button, closing the window or clicking on the background
 * will reject the promise. See `confirm()` below for how to use it in practice.
 **/
var Confirm = React.createClass({
    propTypes: {
        header: React.PropTypes.string,
        body: React.PropTypes.string,
    },
    componentDidMount: function() {
        document.addEventListener("keydown", this._handleEnterKey, false);
        this.deferred = new $.Deferred();
    },
    componentWillUnmount: function() {
        document.removeEventListener("keydown", this._handleEnterKey, false);
    },
    _handleEnterKey: function() {
        if (event.keyCode === 13) {
            this.confirm();
        }
    },
    abort: function() {
        return this.deferred.reject();
    },
    confirm: function() {
        return this.deferred.resolve();
    },
    render: function() {
        var header = this.props.header ? <Modal.Title><span className='text-center'>
                                        {this.props.header}</span></Modal.Title> : <span></span>;
        return <Modal show={true} onHide={this.abort}>
            <Modal.Header closeButton>{header}</Modal.Header>
            <Modal.Body>
                {this.props.body}
                <div className="text-center clearfix">
                    <Button className='confirm-ok-button' bsStyle='primary' onClick={this.confirm}>Ok</Button>
                    <Button className='confirm-cancel-button' bsStyle='primary' onClick={this.abort}>Cancel</Button>
                </div>
            </Modal.Body>
        </Modal>;
    }
});


/**
 * Calling this will open a confirmation window. Clicking on 'Ok' or 'Cancel'
 * will return a resolved or rejected Promise, respectively, i.e. use as
 *
 *     confirm("Are you sure?", {}).then(callback);
 *
 * Options are passed a props to the Confirm component. For the moment there is only
 * {body: "Some text"}.
 **/
var confirm = function(header, options) {
    var props = $.extend({header: header}, options);
    var wrapper = document.body.appendChild(document.createElement('div'));
    var component = ReactDOM.render(<Confirm {...props}/>, wrapper);
    var cleanup = function() {
        ReactDOM.unmountComponentAtNode(wrapper);
        return setTimeout(function() {
            return wrapper.remove();
        });
    };
    return component.deferred.always(cleanup).promise();
    // .always: "do that after the promise being either resolved or rejected"
    // .promise: allow the internal request to run asynchronously, and returns a Promise.
    // The 'deferred' object of Confirm does nothing: just allows to build a Promise.
};


module.exports = {
    Confirm,
    confirm,
};
