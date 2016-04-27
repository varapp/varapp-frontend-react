'use strict';
var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var RestService = require('../../utils/RestService');


var PasswordHasBeenReset = React.createClass({
    componentDidMount() {
        var query = this.props.location.query;
        RestService.resetPasswordConfirm(query.username, query.email, query.activation_code);
    },

    render() {
        return (
            <div className="col-md-6 col-md-offset-3">
                <div id='password-has-been-reset-panel' className='panel panel-default' style={{marginTop: '50px'}}>
                    <div className='panel-heading'>
                        <div className='panel-title'>Password has been reset</div>
                    </div>
                    <div className='panel-body'>

<div>
    <p>
        Your password has been reset. Please check your email to find the new credentials, and log in again.
    </p>
    <p>
        After logging in, we advise you to change your password as soon as possible using the 'Account' section
        on the top right of the window.
    </p>
    <div className='form-actions'>
        <Link to='/login'>Back to login</Link>
    </div>
</div>

                    </div>
                </div>
            </div>

        );
    }
});


module.exports = PasswordHasBeenReset;

