'use strict';
var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;


var AccountWillBeenCreated = React.createClass({
    render() {
        var email = this.props.location.query.email;
        return (
            <div className="col-md-6 col-md-offset-3">
                <div id='account-will-be-created-panel' className='panel panel-default' style={{marginTop: '50px'}}>
                    <div className='panel-heading'>
                        <div className='panel-title'>New account pending validation</div>
                    </div>
                    <div className='panel-body'>
<div>
    <p>
        Your account has been created. It will be validated by an admin shortly.
        You will receive an email at <strong>{email}</strong> when your account has been activated.
    </p>
    <div className='form-actions'>
        <Link to='/login'>Back lo Login</Link>
    </div>
</div>
                    </div>
                </div>
            </div>

        );
    }
});


module.exports = AccountWillBeenCreated;

