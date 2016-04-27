'use strict';
var React = require('react');

var LoginActions = require('../../actions/LoginActions');
var LoginStore = require('../../stores/LoginStore');

/* Utils */
var _ = require('lodash');
var toastr = require('toastr');
var AuthenticatedComponent = require('../login/AuthenticatedComponent');
var FormComponents = require('../login/FormComponents');
var PasswordInput = FormComponents.PasswordInput;

var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;


var FIELDS = {
    username: 'User name',
    email: 'Email',
    firstname: 'First name',
    lastname: 'Last name',
};


var UserAccountPanel = React.createClass({
    getInitialState: function() {
        return {
            user: LoginStore.getUser(),
        };
    },
    componentDidMount: function() {
        LoginStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        LoginStore.removeChangeListener(this._onChange);
    },
    _onChange: function() {
        this.setState({
            user: LoginStore.getUser(),
        });
    },
    render: function() {
        var user = this.state.user;
        return (
            <div className='row' style={{margin: '20px', marginTop:'50px'}}>
                <form name='form' role='form' noValidate className='form-horizontal'>
                    {_.map(_.keys(FIELDS), function(field) {
                        return <EditableField key={field} field={field} user={user} value={user[field]} />;
                    })}
                </form>
                <form name='form' role='form' noValidate className='form-horizontal'>
                    <PasswordChange user={user} />
                </form>
            </div>
        );
    }
});


/**
 * An input containing the user info for a given field.
 * When the text is edited, 'Save' and 'Reset' buttons appear.
 * On click on 'Save', a query is sent to update the data in the database.
 **/
var EditableField = React.createClass({
    getInitialState: function() {
        return {
            value: this.props.value,
        };
    },
    _onChange: function(e) {
        this.setState({ value: e.target.value });
    },
    /* When thid field's 'save' button is clicked */
    changeValue: function(field) {
        var _this = this;
        var user = this.props.user;
        var change = LoginActions.changeAttribute(user.username, user.code, field, this.state.value);
        change.then(
            function() {
                toastr.success("Changed "+field+" to "+ _this.state.value);
            }, function(error) {
                toastr.error("Could not update "+field+": "+error);
            }
        );
    },
    /* When this field's 'reset' button is clicked */
    resetValue: function() {
        this.setState({value: this.props.value});
    },
    render: function() {
        var field = this.props.field;
        var value = this.state.value;
        var label = FIELDS[field];
        return (<div className='form-group' key={field}>
             <label className='control-label col-sm-3' htmlFor={field}>{label}</label>
             <div className='col-sm-6'>
                 <input type="text" name={field} id={field} className="form-control"
                    value={this.state.value}
                    onChange={this._onChange}
                />
             </div>
             {value !== this.props.value ?
                 <Button className={'save-button btn btn-primary'} style={{marginRight: '10px'}} onClick={this.changeValue.bind(null, field)}>
                     Save
                 </Button> : ''}
             {value !== this.props.value ?
                 <Button className={'reset-button btn btn-default'} onClick={this.resetValue.bind(null, field)}>
                     Reset
                 </Button> : ''}
         </div>);
    },
});


var PasswordChange = React.createClass({
    getInitialState: function() {
        return {
            password: '',
            valid: false,
        };
    },
    /* Called whenever the password or password confirmation field is changed */
    passwordChanged: function(field, value, valid) {
        this.setState({
            password: value,
            valid: valid,
        });
    },
    reset: function() {
        this.setState({
            password: '',
            valid: false,
        });
    },
    /* Update the db with the new password value */
    changePassword: function() {
        var user = this.props.user;
        LoginActions.changeAttribute(user.username, user.code, 'password', this.state.password)
            .then(
                function() {
                    toastr.success("Password changed successfully");
                },
                function(error) {
                    toastr.error("Could not update password: "+error);
                }
            );
        // Make the buttons disappear
        this.setState({
            password: '',
            valid: false,
        });
    },
    render: function() {
        // Idc if at this point they want to reduce their password to 4 chars, I want that for 'test'
        return (<div>
            <PasswordInput confirm={this.state.password.length > 0 && !this.state.valid}
                minChars={4} required={false} callback={this.passwordChanged}
                after={this.state.valid ? <span>
                        <Button className={'save-button btn btn-primary'} onClick={this.changePassword} style={{marginRight: '10px'}}>Save</Button>
                        <Button className={'reset-button btn btn-default'} onClick={this.reset}>Cancel</Button>
                     </span>: <span></span>}
             />
        </div>);
    },
});


UserAccountPanel = AuthenticatedComponent(UserAccountPanel);


/* Route component */
var UserAccount = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    propTypes: {
        db: React.PropTypes.string,
    },
    render: function() {
        return (
            <div id='user-account-panel'>
                <UserAccountPanel/>
                <Button className='back-button btn btn-primary' onClick={this.context.router.goBack}>Back</Button>
            </div>
        );
    }
});


module.exports = UserAccount;

