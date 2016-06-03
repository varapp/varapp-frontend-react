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

var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;


var Login = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    getInitialState: function () {
        return {
            username: '',
            password: '',
            valid: {username: false, password: false},
            wrong: false,  // wrong password or user name
        };
    },

    /* Demo version: auto-fill login fields and validate */
    componentWillMount: function() {
        this.isDemo = window.location.hostname === "varapp-demo.vital-it.ch";
        //this.isDemo = window.location.hostname === "varapp-dev.vital-it.ch"; // test dev
        //this.isDemo = window.location.hostname === "localhost";  // test local
        if (this.isDemo) {
            this.setState({
                username: 'demo',
                password: 'demo',
                valid: {username: true, password: true},
            });
        }
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
        var header = <h3>Login</h3>;

        /* Demo version: disable fields edition, use defaults, and display welcome message */
        var placeholder;
        var value;
        var callback = this.formChanged;
        if (this.isDemo) {
            placeholder = 'demo';
            value = 'demo';
            msg = 'Welcome to Varapp ! This is a demo. Click the Login button to enter.';
            callback = function() {};
        }

        return (
            <div>
                <div id='login' className="col-md-6 col-md-offset-3" style={{marginTop: '50px'}}>
                    {msg ? <Panel>{msg}</Panel> : '' }
                    <Panel header={header}>

<form name="form" role="form" noValidate className='form-horizontal'>
    <GenericInput callback={callback}
        id='username' name='username' label='Username'
        placeholder={placeholder} value={value}
        validate={false} wrong={this.state.wrong} />
    <PasswordInput callback={callback}
        confirm={false} required={false} validate={false} wrong={this.state.wrong}
        placeholder={placeholder} value={value} />
    <div className='form-actions col-sm-9 col-sm-offset-3'>
        <button type="submit" className="submit-button btn btn-primary"
            onClick={this.login} disabled={!this.formValid()}>Login</button>
        {!this.isDemo ?
            <Link id='signup-link' to='/signup'>Register</Link> : '' }
        {!this.isDemo ?
            <Link id='forget-password-link' to='/forgetPassword'>I forgot my password</Link> : '' }
    </div>
</form>

                    </Panel>
                </div>
            </div>
        );
    }
});


module.exports = Login;
