'use strict';
var React = require('react');

var _ = require('lodash');
var toastr = require('toastr');

var LoginActions = require('../../actions/LoginActions');

var LoginConstants = require('../../constants/LoginConstants');
var UtilsConstants = require('../../constants/UtilsConstants');
toastr.options = UtilsConstants.TOASTR_OPTIONS;

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var FormComponents = require('./FormComponents');
var GenericInput = FormComponents.GenericInput;
var PasswordInput = FormComponents.PasswordInput;


var Login = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    getInitialState: function () {
        return {
            username: '',
            password: '',
            valid: {username:false, password:false},
            wrong: false,  // wrong password or user name
        };
    },

    login(e) {
        var _this = this;
        e.preventDefault();
        LoginActions.loginUser(this.state.username, this.state.password)
            .fail(function() {
                _this.setState({ wrong: true });
            })
            .then(function() {
                _this.context.router.push('/', {}, null);
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
        var user = this.props.user;
        var status = this.props.loginStatus;
        var msg;
        if (!user) {
            msg = status === LoginConstants.status.EXPIRED ? 'Your session has expired. Please log in again.' : '';
        } else if (!user.isActive) {
            msg = 'This account is not active yet. Please log in again after an admin has taken care of it.';
        }

        return (
            <div>
                <p className='login-message'>{msg}</p>

            <div id='login' className="col-md-6 col-md-offset-3">
                <div className='panel panel-default' style={{marginTop: '50px'}}>
                    <div className='panel-heading'>
                        <div className='panel-title'>Login</div>
                    </div>
                    <div className='panel-body'>

<form name="form" role="form" noValidate className='form-horizontal'>
    <GenericInput callback={this.formChanged} fieldName='username' label='Username' validate={false} wrong={this.state.wrong} />
    <PasswordInput callback={this.formChanged} confirm={false} required={false} validate={false} wrong={this.state.wrong} />
    <div className='form-actions col-sm-9 col-sm-offset-3'>
        <button type="submit" className="submit-button btn btn-primary"
            onClick={this.login} disabled={!this.formValid()}>Login</button>
        <Link id='signup-link' to='/signup'>Register</Link>
        <Link id='forget-password-link' to='/forgetPassword'>I forgot my password</Link>
    </div>
</form>

                    </div>
                </div>
            </div>
            </div>
        );
    }
});


module.exports = Login;

