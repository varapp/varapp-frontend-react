'use strict';
var React = require('react');


/*
  Props:
    label: string,      // The name in front of the input field
    fieldName: string,  // The name of the field as returned in callback(fieldName, value)
    required: bool,     // Display a warning message if the field is required but empty. Default: false.
    callback: func,     // A function with parameters (fieldName, value) that is called on every input change
    validate: bool,     // Validate the input and display an error message if not valid. Default: true.
    inputType: string,  // Type of input field ('text', 'email', ...). Defaults to 'text'.
    errorMsg: string,   // Error message if the input is not valid.
    wrong: bool,        // If true, highlight in red
    All other props are passed to <input/>.
*/
class GenericInput extends React.Component {
    constructor() {
        super();
        this.state = {value: ''};
    }
    update(fieldName, e) {
        var value = e.target.value;
        var valid = this.isValid(value) && (this.props.required ? value.length > 0 : true);
        this.setState({value: value});
        if (this.props.callback) {
            this.props.callback(fieldName, value, valid);
        }
    }
    /* Restrict the possible characters in text input to alphanumeric */
    isAlphanumeric(s) {
        //var re = /^[\w][\w-.@]*$/;
        var re = /^[\w][A-zÀ-ú0-9-.@_ ]*$/;
        //var re = /^(?!_$)(?![-.])(?!.*[_.-]{2})[a-zA-Z0-9_.-]+(?<![.-])$/
        return re.test(s);
    }
    /* If asked to validate, check if it is alphanumeric, otherwise return true */
    isValid(v) {
        return this.props.validate ? this.isAlphanumeric(v) : true;
    }
    render() {
        var {name, label, inputType, required, errorMsg, wrong, ...others} = this.props;
        var value = this.state.value;
        var valid = this.isValid(value);
        var empty = value.length === 0;
        return <div className={'form-group '+ ((!empty && !valid && this.props.validate) || wrong ? 'has-error' : '')}>
            <label className='col-sm-3 control-label'>{label + (required?' *':'')}</label>
            <div className='col-sm-6'>
                <input type={inputType} className="form-control" name={name}
                    onChange={this.update.bind(this, name)} {...others} />
            </div>
            {this.props.validate && !valid && !empty ?
                <div className="col-sm-3"><span className="help-block error-block"
                    >{errorMsg || label +' is not valid'}</span></div> : ''}
            {this.props.required && empty ?
                <div className="col-sm-3"><span className="help-block"
                    >{label +' is required'}</span></div> : ''}
        </div>;
    }
}
GenericInput.propTypes = {
    label: React.PropTypes.string,
    fieldName: React.PropTypes.string,
    required: React.PropTypes.bool,
    callback: React.PropTypes.func,
    validate: React.PropTypes.bool,
    inputType: React.PropTypes.string,
    errorMsg: React.PropTypes.string,
};
GenericInput.defaultProps = {
    validate: true,
    required: false,
    inputType: 'text',
};


/* EMAIL */


class EmailInput extends GenericInput {
    isEmailValid(s) {
        var re = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
        return re.test(s);
    }
    isValid(v) {
        return this.props.validate ? this.isEmailValid(v) : true;
    }
}
EmailInput.defaultProps = {
    name: 'email',
    label: 'Email',
    validate: true,
    type: 'email',
};


/* PHONE */


class PhoneInput extends GenericInput {
    isPhoneValid(s) {
        var re = /^[+]?([0-9 .\/()]*)$/;
        return re.test(s);
    }
    isValid() {
        return !this.props.validate || this.isPhoneValid(this.state.value);
    }
}
PhoneInput.defaultProps = {
    name: 'phone',
    label: 'Phone number',
    validate: true,
    required: false,
};


/*
  Props:
    after: component,   //
    minChars: int,      // Min number of characters for the password to be valid
*/
class PasswordInput extends React.Component {
    constructor() {
        super();
        this.updatePassword = this.updatePassword.bind(this);
        this.updateConfirmedPassword = this.updateConfirmedPassword.bind(this);
        this.state = {
            password: '',
            password2: '',
        };
    }
    /* Signal the parent that changed occurred */
    formChanged(pwd, pwd2) {
        var confirm = this.props.confirm;
        var validate = this.props.validate;
        if (this.props.callback) {
            var valid = (confirm ? pwd === pwd2 : true) && (validate ? this.passwordValid(pwd) : true);
            this.props.callback('password', pwd, valid);
        }
    }
    /* Set password when it changes */
    updatePassword(e) {        this.setState({password: e.target.value});
        this.formChanged(e.target.value, this.state.password2);

    }
    /* Set password2 when it changes */
    updateConfirmedPassword(e) {
        this.formChanged(this.state.password, e.target.value);
        this.setState({password2: e.target.value});
    }
    /* Restrict the possible characters in password input (?) */
    passwordValid(s) {
        var re = /^.+$/;
        return s.length >= this.props.minChars && re.test(s);
    }
    render() {
        var {confirm, wrong, required, validate, after, ...others} = this.props;
        var password = this.state.password;
        var empty = password.length === 0;
        var valid = this.passwordValid(this.state.password);
        var confirmed = password === this.state.password2;
        var hasError = validate && !valid && !empty;
        var errorMsg = !validate ? '' :
            password.length < this.props.minChars ? 'Password is too short (min 8 chars)' : 'Password is not valid';
        return (
            <div>
                <div className={'form-group '+ (hasError ? 'has-warning' : wrong ? 'has-error' : '')}>
                    <label className='col-sm-3 control-label'>{'Password' + (required?' *':'')}</label>
                    <div className='col-sm-6'>
                        <input type='password' name='password' id='password' className="form-control"
                            onChange={this.updatePassword} {...others} />
                    </div>
                    {hasError ?
                        <div className="col-sm-3"><span className="help-block error-block"
                            >{errorMsg}</span></div> : ''}
                    {after}
                </div>
                {confirm ? (
                    <div className={'form-group '+ (!confirmed ? 'has-warning':'')}>
                        <label className='col-sm-3 control-label'>Confirm password *</label>
                        <div className='col-sm-6'><input type="password" name="password2" id="password2" className="form-control"
                            onChange={this.updateConfirmedPassword} /></div>
                        {!confirmed && !empty ?
                            <div className="col-sm-3"><span className="help-block error-block"
                                >Password must match</span></div> : ''}
                    </div>) : ''}
            </div>
        );
    }
}
PasswordInput.propTypes = {
    required: React.PropTypes.bool,
    callback: React.PropTypes.func,
    validate: React.PropTypes.bool,
    inputType: React.PropTypes.string,
    minChars: React.PropTypes.number,
};
PasswordInput.defaultProps = {
    validate: true,
    required: true,
    confirm: false,
    minChars: 8,
};


module.exports = {
    GenericInput,
    EmailInput,
    PhoneInput,
    PasswordInput,
};
