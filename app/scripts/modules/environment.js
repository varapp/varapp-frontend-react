'use strict';

var EnvConfig = function(){
    var host = window.location.hostname;   // the machine alias, or localhost
    this.isProd = true;
    this.backendUrl = 'https://' + host + '/backend';  // Because of the proxy definition in Apache config
    this.frontendUrl = 'https://' + host;
    if (host === 'localhost') {
        this.isProd = false;
        this.backendUrl = 'http://' + host+':8000' + '/varapp';  // No Apache config with Django's "manage.py startserver"
        this.frontendUrl = 'http://' + host+':3000';
    }
};
module.exports = new EnvConfig();

