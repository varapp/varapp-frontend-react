'use strict';
var React = require('react');
var _ = require('lodash');
var AppActions = require('../../actions/AppActions');
var LoginActions = require('../../actions/LoginActions');

var AuthenticatedComponent = require('../login/AuthenticatedComponent');

var ReactBootstrap = require('react-bootstrap');
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var LinkToVarapp = require('../utils/LinkToVarapp');

var LoginStore = require('../../stores/LoginStore');


var Header = React.createClass({
    propTypes: {
        db: React.PropTypes.string,
    },

    render: function() {
        return (
            <div className='header' id='header'>
                <NavPills db={this.props.db} />
                <span className='navbar-brand' style={{padding: '0px', 'marginRight': '15px'}}>
                    <div className='navbar-left header-brand-icon'>
                        <a href='http://www.isb-sib.ch/' target='_blank'>
                            <img height='35' alt='SIB' src='images/sib_logo_medium.jpg'/>
                        </a>
                    </div>
                    <div className='navbar-left header-brand-icon'>
                        <a href='http://www.chuv.ch/' target='_blank'>
                            <img height='35' alt='CHUV' src='images/CHUV_logo2.png'/>
                        </a>
                    </div>
                </span>
                <LinkToVarapp style={{textDecoration: 'none'}}><h3 className="text-muted">
                    {"Varapp browser"}
                </h3></LinkToVarapp>
            </div>
        );
    }
});


var NavPills = React.createClass({
    getInitialState: function () {
        return {
            db: this.props.db,
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
        this.setState({ user: LoginStore.getUser() });
    },
    changeDB: function(eventKey, e) {
        var dbname = e.target.innerHTML;
        AppActions.changeDatabase(dbname);
        /* Make the change visible right away, otherwise it changes only when all stores finish loading */
        this.setState({ db: dbname });
    },

    render: function() {
        var user = this.state.user;
        var db = this.props.db;
        var logoutLink = <Link id='header-logout-link' to='/login' onClick={LoginActions.logoutUser}>{"Log out"}</Link>;
        /* Logged in and active */
        if (user && user.isActive) {
            var showUsername = <div style={{padding: '10px 15px'}}>Logged in as <strong>{user.username}</strong></div>;
            var adminLink = ['superuser','admin'].indexOf(user.role.name) >= 0 ?
                <Link to='/admin' id='admin-link'>Admin</Link> : '';
            var accountLink = <Link to='/userAccount' id='user-account-link'>My account</Link>;
            return (
                <ul className="nav nav-pills pull-right">
                    <li>{showUsername}</li>
                    <li><DatabasesMenu user={user} db={db} callback={this.changeDB}/></li>
                    <li>{accountLink}</li>
                    <li>{adminLink}</li>
                    <li>{logoutLink}</li>
                </ul>
            );
        /* Logged in but not active */
        } else if (user) {
            return <ul className="nav nav-pills pull-right">
                    <li>{logoutLink}</li>
                </ul>;
        /* Not logged in */
        } else {
            return <ul className="nav nav-pills pull-right"></ul>;
        }
    },
});


var DatabasesMenu = AuthenticatedComponent(React.createClass({
    render: function() {
        var _this = this;
        var user = this.props.user;
        var db = this.props.db;
        var databasesMenu = _.chain(user.databases)
            .sortBy('name')
            .map(function(d,i) {
                return <MenuItem key={'db-menu-'+i} onSelect={_this.props.callback}
                        active={db === d.name}>{d.name}</MenuItem>;
            }).value();
        return <DropdownButton id='select-database' title={db ? 'Database: '+db : 'Choose database'}>
                {databasesMenu}
            </DropdownButton>;
    }
}));


module.exports = Header;
