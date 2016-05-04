'use strict';
var React = require('react');
var _ = require('lodash');
var toastr = require('toastr');
var UtilsConstants = require('../../constants/UtilsConstants');
var LoginActions = require('../../actions/LoginActions');
toastr.options = UtilsConstants.TOASTR_OPTIONS;

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

//var ReactBootstrap = require('react-bootstrap');
//var Input = ReactBootstrap.Input;

var FormComponents = require('./FormComponents');
var GenericInput = FormComponents.GenericInput;
var EmailInput = FormComponents.EmailInput;
var PhoneInput = FormComponents.PhoneInput;
var PasswordInput = FormComponents.PasswordInput;


var Signup = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    getInitialState: function () {
        return {
            username: '',
            password: '',
            firstname: '',
            lastname: '',
            email: '',
            phone: '',
            valid: {username:false, email:false, password:false},
        };
    },

    /**
     * Does the same as logging in (update with JWT content),
     * except the user is not tagged as authenticated yet (waits for admin to validate).
     **/
    signup: function(e) {
        var _this = this;
        e.preventDefault();
        LoginActions.signupUser(this.state.username, this.state.password,
                           this.state.firstname, this.state.lastname, this.state.email, this.state.phone)
            .then(function() {
                _this.context.router.push({pathname: '/accountWillBeCreated', query: {email: _this.state.email}});
            });
    },

    /* Called back from every input */
    formChanged: function(field, value, valid) {
        var state = this.state;
        state[field] = value;
        state.valid[field] = valid;
        this.setState(state);
    },

    formValid: function() {
        return _.every(this.state.valid);
    },

    render() {
        var msg;
        return (
            <div>
                <div className="col-md-6 col-md-offset-3">
                    <div className='panel panel-default' style={{marginTop: '20px'}}>
                        <div className='panel-heading'>
                            <div className='panel-title'>
                                Register new user
                            </div>
                        </div>
                        <div className='panel-body'>

<form id='signup-form' name="form" role="form" noValidate className='form-horizontal'>
    <GenericInput callback={this.formChanged} id='username' name='username' label='Username' required />
    <GenericInput callback={this.formChanged} id='firstname' name='firstname' label='First name' />
    <GenericInput callback={this.formChanged} id='lastname' name='lastname' label='Last name' />
    <EmailInput callback={this.formChanged} label='Email' required />
    <PhoneInput callback={this.formChanged} />
    <PasswordInput callback={this.formChanged} confirm />
    <div className='form-actions col-sm-9 col-sm-offset-3'>
        <button type="submit" className="submit-button btn btn-primary" disabled={!this.formValid()}
            onClick={this.signup}>Submit</button>
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


module.exports = Signup;

