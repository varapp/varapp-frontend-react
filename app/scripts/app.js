'use strict';
var React = window.React = require('react');
var ReactDOM = window.React = require('react-dom');
var toastr = require('toastr');
var _ = require('lodash');

/* Actions */
var AppActions = require('./modules/actions/AppActions');
var VariantActions = require('./modules/actions/VariantActions');
var LoginActions = require('./modules/actions/LoginActions');

/* Main submodules */
var VarappBrowserApp = require('./modules/react/VarappBrowserApp');
var Header = require('./modules/react/header/Header');
var SamplesSelection = require('./modules/react/samples/SamplesSelection');
//var Footer = require('./modules/react/header/Footer');

/* Login and admin submodules */
var Login = require('./modules/react/login/Login');
var Admin = require('./modules/react/admin/Admin');
var UserAccount = require('./modules/react/admin/UserAccount');
var Signup = require('./modules/react/login/Signup');
var ResetPassword = require('./modules/react/login/ResetPassword');
var PasswordChangeRequested = require('./modules/react/login/PasswordChangeRequested');
var PasswordHasBeenReset = require('./modules/react/login/PasswordHasBeenReset');
var AccountWillBeCreated = require('./modules/react/login/AccountWillBeCreated');

/* Stores */
var AppStore = require('./modules/stores/AppStore');
var LoginStore = require('./modules/stores/LoginStore');
var VariantsLoaderStore = require('./modules/stores/VariantsLoaderStore');
var RouterStore = require('./modules/stores/RouterStore');

/* Constants */
var LoginConstants = require('./modules/constants/LoginConstants');

/* Router */
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;
var useRouterHistory = ReactRouter.useRouterHistory;
var createHashHistory = require('history').createHashHistory;
var history = useRouterHistory(createHashHistory)({ queryKey: false });

/* Utils */
var XHRUtils = require('./modules/utils/XHRUtils');
var duplicateXHRKiller = XHRUtils.duplicateXHRKiller;
duplicateXHRKiller.addURI('variants', 'stats');
var Api = require('./modules/utils/Api');


/**
 * Wrapper component with the header and navigation. Stores current db and user,
 * handles auto-re-login on page reload.
 **/
var App = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    getInitialState: function () {
        console.log("URL query params:", JSON.stringify(this.props.location.query, true, 2));
        var urlQuery = this.props.location.query;
        var localQuery = JSON.parse(localStorage.getItem('query')) || {};
        return {
            db: urlQuery.db || localQuery.db,
            user: LoginStore.getUser(),
            isLoggingIn: false,
            loginStatus: LoginStore.getStatus(),
        };
    },
    /**
     * What happens - only once - when the page is reloaded:
     * reuse the existing JWT to log in without asking for user credentials.
     **/
    componentDidMount: function () {
        LoginStore.addChangeListener(this._onUserChange);
        AppStore.addChangeListener(this._onAppChange);
        VariantsLoaderStore.addChangeListener(this._loadVariants);
        RouterStore.addChangeListener(this._onUrlChange);
        var path = this.props.location.pathname;
        /* If already logged before, reuse JWT to relog automatically on page reload */
        var jwt = localStorage.getItem('jwt');
        if (jwt) {
            //console.log("app.js :: Logging in with JWT found in localStorage")
            this.setState({
                isLoggingIn: true
            });
            LoginActions.updateUser();
            /* If stores are already loaded (for instance after session expiration and re-login),
               reload variants right away. Otherwise it goes through _onAppChange after stores are loaded,
               which triggers the variants query */
            if (AppStore.storesReady()) {
                this._loadVariants();
            }
        /* These routes do not require authentication */
        } else if (path === '/signup' || path === '/forgetPassword') {
            return;
        /* If JWT is not found, redirect to login */
        } else {
            this.context.router.push({pathname: '/login', query: {}});
        }
    },
    componentWillUnmount: function () {
        LoginStore.removeChangeListener(this._onUserChange);
        AppStore.removeChangeListener(this._onAppChange);
        VariantsLoaderStore.removeChangeListener(this._loadVariants);
        RouterStore.removeChangeListener(this._onUrlChange);
    },
    /**
     * Init stores, only once - when user logs in.
     * Changing the URL manually will reload the whole app, and localStorage is set to record
     * a previous session. Stores are initialized depending on either of them, so it can
     * be done here at top-level.
     * Give priority to parameters passed by URL, and read localStorage for the rest.
     **/
    _initStores: function(db) {
        if (AppStore.storesReady() || AppStore.isLoadingStores()) {
            return;
        }
        console.warn(">> INIT STORES <<");
        var urlQuery = this.props.location.query;
        var localQuery = JSON.parse(localStorage.getItem('query')) || {};  // dependant on db, like samples selection or filters set
        var localPrefs = JSON.parse(localStorage.getItem('preferences')) || {};  // independant on db, like columns selection
        var order_by = urlQuery.order_by || localQuery.order_by;
        var columns = urlQuery.columns || localPrefs.columns;
        var samplesQuery = urlQuery.samples || localQuery.samples;
        var filtersQuery = urlQuery.filter || localQuery.filter;
        if (typeof(filtersQuery) === 'string') {filtersQuery = [filtersQuery];}
        if (typeof(samplesQuery) === 'string') {samplesQuery = [samplesQuery];}
        var query = {
            db: db,
            filter: filtersQuery,
            samples: samplesQuery,
            order_by: order_by,
            columns: columns,
        };
        AppStore.resetStores(db, query);
    },

    /* Callbacks */

    /* Happens whenever a sample or filter changed, or stores finished loading,
       or stores are already loaded and App.js was mounted */
    _loadVariants: function() {
        console.debug("App.js :: Trigger load variants");
        VariantActions.loadVariants(this.state.db, Api.variantUrlArgs());
    },
    /*  */
    _onUrlChange: function() {
        var path = this.props.location.pathname;
        if (path === '/' && AppStore.storesReady()) {
            var query = RouterStore.getQuery();
            this.context.router.push({pathname: '/', query: query, state: null});
        }
    },
    /* Happens when the user changes the db (not at startup, where it is read from storage/url)
       or uses a bookmark (same db, but changes stores state) */
    _onAppChange: function () {
        var newDb = AppStore.getDb();
        this.setState({
            db: newDb,
        });
        if (AppStore.storesReady()) {
            this._loadVariants();
        }
    },
    /* Happens on every filter/sample change, because it renews the JWT,
       and also at login - page refresh */
    _onUserChange: function () {
        var user = LoginStore.getUser();
        var loginStatus = LoginStore.getStatus();
        var path = this.props.location.pathname;
        if (!user || !user.isActive) {
            if (this.isMounted()) {     // TODO: get rid of this. The error happens when auth token expired and we reconnect to the app
                AppStore.init(null);
                if (path === '/' || path === '/login' || path === '/samples') {
                    this.context.router.push({pathname: '/login', query: {}});
                }
            }
        }
        if (loginStatus === LoginConstants.status.EXPIRED) {

            this.setState({
                user: null,
                loginStatus: loginStatus,
                isLoggingIn: false,
            });

        /* New connection or user changed */
        } else if (loginStatus === LoginConstants.status.NEW) {
            console.log("App :: change user:", user.username);
            /* If the user cannot access the given db, use the first one he has access to */
            var db = this.state.db;
            var databases = _.map(user.databases, 'name');
            if (databases.indexOf(db) < 0) {
                if (db) {
                    toastr.warning('Database "'+ db +'" not found');
                }
                db = databases.length > 0 ? databases[0] : undefined;
            }

            this.setState({
                db: db,
                user: user,
                loginStatus: loginStatus,
                isLoggingIn: false,
            });

            this._initStores(db);
        }
    },

    render: function() {
        var db = this.state.db;
        var user = this.state.user;
        var loginStatus = this.state.loginStatus;
        var content;
        //console.log("App user:", user.username, "- db:", db);
        /* Waiting for server response while checking JWT */
        if (this.state.isLoggingIn) {
            content = <div></div>;
        /* Everything ok, load components */
        } else {
            content = this.props.children && React.cloneElement(this.props.children,
                {
                    db: db,
                    user: user,
                    loginStatus: loginStatus,
                }
            );
        }
        return <div id='app'>
                <Header db={db}/>
                {content}
            </div>;
    }
});


/***********
 * Routing *
 ***********/

/* Clear toastr error bubbles (concerning an unmounted component that we transitioned from) */
var clearBubbles = function() {
    toastr.remove();
};

//var TestComponent = React.createClass({
//    render: function() {
//        return <div id='app'>React sucks</div>;
//    }
//});

var routes = (
    <Route path='/' component={App}>
        <IndexRoute component={VarappBrowserApp} onEnter={clearBubbles} />
        <Route path='samples' component={SamplesSelection} onEnter={clearBubbles} />
        <Route path='admin' component={Admin} />
        <Route path='userAccount' component={UserAccount} />
        {/* Login stuff */}
        <Route path='login' component={Login} onEnter={clearBubbles} />
        <Route path='signup' component={Signup} />
        <Route path='forgetPassword' component={ResetPassword} />
        <Route path='passwordChangeRequested' component={PasswordChangeRequested} />
        <Route path='passwordHasBeenReset' component={PasswordHasBeenReset} />
        <Route path='accountWillBeCreated' component={AccountWillBeCreated} />
        {/*<Route path='example' component={TestComponent}>*/}
    </Route>
);

var mountNode = document.getElementById('app-container');
ReactDOM.render(
    <Router routes={routes} history={history} onUpdate={AppActions.locationChanged} />
    //<TestComponent/>
    , mountNode);

