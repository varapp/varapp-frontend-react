'use strict';
var React = require('react');
var _ = require('lodash');
var RestService = require('../../utils/RestService');
var toastr = require('toastr');
var UtilsConstants = require('../../constants/UtilsConstants');
toastr.options = UtilsConstants.TOASTR_OPTIONS;

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var FormComponents = require('./FormComponents');
var GenericInput = FormComponents.GenericInput;
var EmailInput = FormComponents.EmailInput;


var ChangePassword = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    getInitialState: function () {
        return {
            username: '',
            email: '',
            valid: {username:false, email:false},
        };
    },

    resetPassword(e) {
        var _this = this;
        e.preventDefault();
        RestService.resetPasswordRequest(this.state.username, this.state.email)
            .then(function() {
                _this.context.router.push({pathname: '/passwordChangeRequested', query: {email: _this.state.email}});
            });
    },

    formValid: function() {
        return _.every(this.state.valid);
    },
    formChanged: function(field, value, valid) {
        var state = this.state;
        state[field] = value;
        state.valid[field] = valid;
        this.setState(state);
    },

    render() {
        var msg;
        return (
            <div>
                <p className='login-message'>{msg}</p>

            <div className="col-md-6 col-md-offset-3">
                <div id='forget-password-link' className='panel panel-default' style={{marginTop: '50px'}}>
                    <div className='panel-heading'>
                        <div className='panel-title'>Reset Password</div>
                    </div>
                    <div className='panel-body'>

<form id='forget-password-form' name="form" role="form" noValidate className='form-horizontal'>
    <GenericInput callback={this.formChanged} fieldName='username' label='Username' />
    <EmailInput callback={this.formChanged} label='Email' />
    <div className='form-actions col-sm-9 col-sm-offset-3'>
        <button type="submit" className="submit-button btn btn-primary" disabled={!this.formValid()}
            onClick={this.resetPassword}>Submit</button>
        <Link to='/login'>Cancel</Link>
    </div>
</form>

                    </div>
                </div>
            </div>
            </div>
        );
    }
});


module.exports = ChangePassword;

