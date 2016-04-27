var React = require('react');
var LoginStore = require('../../stores/LoginStore');


var AuthenticatedComponent = function(OriginalComponent) {
    return React.createClass({
        getInitialState: function() {
            return this._getLoginState();
        },

        _getLoginState: function() {
            return {
                isAuthenticated: LoginStore.isAuthenticated(),
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
            if (this.isMounted()) {   // TODO: this is bad ! it may indicate a memory leak. Fix somehow.
                this.setState(this._getLoginState());
            }
        },

        render() {
            if (!this.state.isAuthenticated) {
                return <div className='please-login'></div>;
            }
            return (
                <OriginalComponent
                    {...this.props}
                    user={this.state.user}
                />
            );
        }

    });
};

module.exports = AuthenticatedComponent;


