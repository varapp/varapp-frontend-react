'use strict';

var BaseStore = require('./BaseStore');
var LoginConstants = require('../constants/LoginConstants');
var ApiConstants = require('../constants/ApiConstants');
var jwtDecode = require('jwt-decode');


class LoginStore extends BaseStore {
    constructor() {
        this.user = null;
        this.status = LoginConstants.status.LOGGED_OUT;  // 'expired', 'new', '...'
        this.isActive = null;  // user activated by admin
        this.subscribe(() => this._registerToActions.bind(this));
    }

    /* Getters */
    isAuthenticated() { return (!! this.user) && this.user.isActive; }
    getUser() { return this.user; }
    getStatus() { return this.status; }

    renewJWT(jwt) {
        var savedJwt = localStorage.getItem('jwt');
        var token;
        if (jwt) {
            //console.log("New JWT set : ", jwt)
            localStorage.setItem('jwt', jwt);
            token = jwt;
        } else {
            //console.log("Using previous JWT : ", savedJwt)
            token = savedJwt;
        }
        return token;
    }

    /**
     * Update this.user based on JWT content. If 'isactive' is true, allow the user to
     * use the app (login). Otherwise, wait for admin to validate (signup).
     **/
    updateUser(jwt) {
        var token = this.renewJWT(jwt);
        var newUser = jwtDecode(token);
        /* New log in - there is no way to change user without logging out first (except edit jwt manually) */
        if (!this.user && newUser) {
            this.status = LoginConstants.status.NEW;
        }
        this.user = newUser;
        this.emitChange();
    }

    expire() {
        this.user = null;
        this.status = LoginConstants.status.EXPIRED;
        this.emitChange();
    }

    logout() {
        this.user = null;
        this.status = LoginConstants.status.LOGGED_OUT;
        localStorage.removeItem('jwt');
        this.emitChange();
    }

    _registerToActions(payload) {
        if (payload.state === ApiConstants.ERROR && payload.error) {
            if (payload.error.status === 403 && payload.error.responseText === "Signature has expired") {
                this.expire();
                return true;
            }
        }

        switch (payload.actionType) {

            /* These update the user (and emit change) */

            case LoginConstants.ACTION_LOGIN_USER:
                if (payload.state === ApiConstants.SUCCESS) {
                    console.log("LoginStore :: ACTION_LOGIN_USER");
                    this.updateUser(payload.jwt);
                }
                break;

            case LoginConstants.ACTION_SIGNUP_USER:
                if (payload.state === ApiConstants.SUCCESS) {
                    console.log("LoginStore :: ACTION_SIGNUP_USER");
                    this.updateUser(payload.jwt);
                }
                break;

            case LoginConstants.ACTION_ATTRIBUTE_DB:
                if (payload.state === ApiConstants.SUCCESS) {
                    console.log("LoginStore :: ACTION_ATTRIBUTE_DB");
                    this.updateUser(payload.jwt);
                }
                break;

            case LoginConstants.ACTION_CHANGE_ATTRIBUTE:
                if (payload.state === ApiConstants.SUCCESS) {
                    console.log("LoginStore :: ACTION_CHANGE_ATTRIBUTE");
                    this.updateUser(payload.jwt);
                }
                break;

            /* -------------------- */

            /* Log out */
            case LoginConstants.ACTION_LOGOUT_USER:
                //console.log("LoginStore :: ACTION_LOGOUT_USER");
                this.logout();
                break;

            /* Does not emit a change, just send a signal to the server to get a renewed token */
            case LoginConstants.ACTION_RENEW_SESSION:
                //console.log("LoginStore :: ACTION_RENEW_SESSION");
                this.renewJWT(payload.jwt);
                break;

            case LoginConstants.ACTION_UPDATE_USER:
                this.updateUser(payload.jwt);
                break;

            default:
                return true;
        }
        return true;
    }
}


module.exports = new LoginStore();
