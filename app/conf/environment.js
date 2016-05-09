'use strict';

var config = require('./conf.js');

var http = config.USE_HTTPS ? "https://" : "http://";
var host = config.BACKEND_HOST || window.location.hostname;
var path = config.BACKEND_PATH || '/backend';  // see (if any) proxy definition in Apache config

var EnvConfig = function(){
    if (host === 'localhost') {
        this.isProd = false;
        this.backendUrl = 'http://localhost:8000/varapp';  // No Apache config with Django's "manage.py startserver"
        this.frontendUrl = 'http://localhost:3000';
    } else {
        this.isProd = true;
        this.backendUrl = http + host + path;
        this.frontendUrl = http + host;
    }
};
module.exports = new EnvConfig();

