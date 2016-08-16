'use strict';
var React = require('react');

var LoginActions = require('../../actions/LoginActions');
var AdminActions = require('../../actions/AdminActions');

var AdminStore = require('../../stores/AdminStore');

var _ = require('lodash');
var AuthenticatedComponent = require('../login/AuthenticatedComponent');
var Confirm = require('../utils/Confirm');

var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;


var AdminPanel = React.createClass({
    getInitialState: function() {
        var users = AdminStore.getUsers();
        var dbs = AdminStore.getDatabases();
        return {
            users: users,
            databases: dbs,
            selectedUser: null,
        };
    },

    componentDidMount: function() {
        AdminStore.addChangeListener(this._onChange);
        AdminActions.fetchUsersInfo();
    },
    componentWillUnmount: function() {
        AdminStore.removeChangeListener(this._onChange);
    },
    _onChange: function() {
        this.setState({
            users: AdminStore.getUsers(),
            databases: AdminStore.getDatabases(),
        });
    },

    /* Replace the object representing this user in this.state.users by this object, and trigger update */
    updateUser: function(user) {
        var users = this.state.users;
        var idx = _.findIndex(users, function(u) {
            return (u.username === user.username) && (u.code === user.code);
        });
        users[idx] = user;
        this.setState({
            users: users,
        });
    },

    selectUser: function(user, e) {
        e.stopPropagation();
        this.setState({selectedUser: user});
    },
    noSelection: function() {
        this.setState({selectedUser: null, selectDb: null});
    },
    /* Activate or deactivate a user, depending on the value of the parameter `activate` */
    userActivation: function(user, index, activate, e) {
        e.stopPropagation();
        LoginActions.activateUser(user.username, user.code, user.email, activate);
        var users = this.state.users;
        users[index].isActive = activate;
        this.setState({
            users: users,
        });
    },
    /* Delete a user from the database */
    deleteUser: function(user, index, e) {
        e.stopPropagation();
        var _this = this;
        Confirm.confirm("Delete account '"+user.username+"' ?").then(function() {
            LoginActions.deleteUser(user.username, user.code);
            var users = _this.state.users;
            users.splice(index, 1);  // remove it
            _this.setState({
                users: users,
            });
        });
    },
    /* Add access to a database for a given user */
    attributeDb: function(db, add) {
        var user = this.state.selectedUser;
        var hasDb = _.find(user.databases, {name: db.name});
        /* Add to existing databases (if not already present) */
        if (add) {
            if (!hasDb) {
                user.databases.push(db);
                LoginActions.attributeDb(user.username, user.code, db.name, true);
            }
        /* Remove from existing databases (if present) */
        } else if (hasDb) {
            Confirm.confirm("Deny access to database '"+db.name+"' ?").then(function() {
                _.remove(user.databases, {name: db.name});
                LoginActions.attributeDb(user.username, user.code, db.name, false);
            });
        }
        this.updateUser(user);
    },
    /* Give a different role to a given user */
    changeRole: function(user, roleName) {
        if (user.role.name !== roleName) {
            LoginActions.changeAttribute(user.username, user.code, 'role', roleName);
            user.role.name = roleName;
            this.updateUser(user);
        }
    },

    render: function() {
        var _this = this;
        var thisUser = this.props.user;  // AuthenticatedComponent
        var selectedUser = this.state.selectedUser;

        /* Role selection dropdown */
        var roleSelectionItems = function(user) {
            var roles = AdminStore.getRoles();
            return _.map(roles, function(roleName,i) {
                return <MenuItem key={i} onSelect={_this.changeRole.bind(null, user, roleName)}>
                    <div className={'role-'+roleName} active={roleName===user.role.name}>{roleName}</div>
                </MenuItem>;
            });
        };

        /* Users summary panel */
        var users = _.map(this.state.users, function(user, i) {
            var cls = (selectedUser && (user.code === selectedUser.code)) ? 'info' : '';
            var canUpdate = (thisUser.username !== user.username && thisUser.code !== user.code)
                && (thisUser.role.rank < user.role.rank);
            return <tr key={user.username+i} onClick={_this.selectUser.bind(null, user)} className={cls}>
                <td>{user.username}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.email}</td>
                <td className={'role-'+user.role.name}>
                    <DropdownButton title={user.role.name} id='role-selection-dropdown' disabled={!canUpdate}>
                        {roleSelectionItems(user)}
                    </DropdownButton>
                </td>
                <td>{(thisUser.role.can_validate_user && canUpdate) ?
                    (user.isActive ?
                    <Button className='btn btn-primary' onClick={_this.userActivation.bind(null, user, i, false)}>
                        Deactivate</Button> :
                    <Button className='btn btn-success' onClick={_this.userActivation.bind(null, user, i, true)}>
                        Activate</Button>
                    ) : <span></span>}
                </td>
                <td>{(thisUser.role.can_delete_user && canUpdate) ?
                    <Button className='btn btn-danger' onClick={_this.deleteUser.bind(null, user, i)}>Delete</Button> :
                    <span></span>}
                </td>
            </tr>;
        });

        /* Databases summary panel */
        var databases = selectedUser ? selectedUser.databases : this.state.databases;
        if (databases) {
            databases = _.sortBy(databases, function (d) { return d.name.toLowerCase(); });
        }
        var visibleDbs = _.map(databases, function(db, i) {
            return <tr key={i}>
                <td>{db.name}</td>
                <td>{db.description}</td>
                <td>{selectedUser ?
                    <Button className='btn btn-danger' onClick={_this.attributeDb.bind(null, db, false)}>Remove</Button> :
                    <span></span>}</td>
            </tr>;
        });

        /* Dropdown menu to choose a database to add */
        var MenuDbs = function() {
            if (selectedUser) {
                var dbs = _.sortBy(_this.state.databases, function (d) { return d.name.toLowerCase(); });
                var menuDbsItems = _.map(dbs, function(db, i) {
                        return <MenuItem key={i} onSelect={_this.attributeDb.bind(null, db, true)}>{db.name}</MenuItem>;
                    });
                return <DropdownButton title="Databases" id="admin-select-db-dropdown">
                        {menuDbsItems}
                    </DropdownButton>;
            } else {
                return <span></span>;
            }
        };

        return (
            <div>
            <div className='admin-users-panel col-lg-8 table-responsive'>
                <h3>Users</h3>
                <Button onClick={this.selectUser.bind(null,null)}>Clear selection</Button>
                <div className='table-container'>
                <table className='table table-hover'>
                    <thead><tr>
                        <th>User name</th>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Is active?</th>
                        <th></th>
                    </tr></thead>
                    <tbody>
                    {users}
                </tbody></table>
                </div>
            </div>
            <div className='admin-dbs-panel col-lg-4 table-responsive'>
                <h3>Databases {selectedUser ? 'of user '+ selectedUser.username : ''}</h3>
                {MenuDbs()}
                <div className='table-container'>
                <table className='table table-hover'>
                    <thead><tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th></th>
                    </tr></thead>
                    <tbody>
                    {visibleDbs}
                </tbody></table>
                </div>
            </div>
            </div>
        );
    }
});

AdminPanel = AuthenticatedComponent(AdminPanel);


/* Route component */
var Admin = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    propTypes: {
        db: React.PropTypes.string,
    },
    render: function() {
        return (
            <div id='admin-panel'>
                <AdminPanel/>
                <Button className='back-button btn btn-primary' onClick={this.context.router.goBack}>Back</Button>
            </div>
        );
    }
});


module.exports = Admin;

