'use strict';
var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;


var PasswordChangeRequested = React.createClass({
    render() {
        var email = this.props.location.query.email;
        return (
            <div className="col-md-6 col-md-offset-3">
                <div id='password-change-request-panel' className='panel panel-default' style={{marginTop: '50px'}}>
                    <div className='panel-heading'>
                        <div className='panel-title'>Password change request sent</div>
                    </div>
                    <div className='panel-body'>

<div>
    <p>
        A new password has been requested for your varapp account.
        You will receive an email shortly with a confirmation link
        at <strong>{email}</strong> to verify that you are
        really the author of this request.
    </p>
    <p>
        Once confirmed, you will receive a second email with your new account credentials.
    </p>
    <div className='form-actions'>
        <Link to='/login'>Back</Link>
    </div>
</div>

                    </div>
                </div>
            </div>

        );
    }
});


module.exports = PasswordChangeRequested;

