
var CONFIG = {
    // REST calls to backend will use 'http://${BACKEND_HOST}/${BACKEND_PATH}'.
    // If USE_HTTPS is true, REST calls will use 'https://' instead of 'http://'
    USE_HTTPS: true,
    BACKEND_HOST: window.location.hostname,
    BACKEND_PATH: '/backend',
}

module.exports = CONFIG;
