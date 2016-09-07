#!/usr/bin/env bash

if [ "$#" -ne 3 ]; then
    echo ""
    echo "Usage: deploy.sh <REMOTE> <REMOTE_DIR> <SETTINGS>"
    echo "Params:"
    echo "  REMOTE: name of the server, e.g. varapp@varapp.vital-it.ch"
    echo "  REMOTE_DIR: path on the destination server where to copy the app archive, e.g. /var/www/html/varapp"
    echo "  settings: settings file to replace app/conf/conf.js, e.g. ../conf/conf_prod.js"
    echo ""
    exit 1
fi;

REMOTE=$1
REMOTE_DIR=$2
SETTINGS=$3

echo ""
echo "REMOTE="${REMOTE}
echo "REMOTE_DIR="${REMOTE_DIR}
echo "SETTINGS="${SETTINGS}
echo ""

echo ${PATH}
echo ${NVM_DIR}
[ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh"
${NVM_DIR}/nvm.sh use 4.2.0
which node
echo "node version: "$(node -v)
echo "npm version: "$(npm -v)
echo ""

npm install
bower install
echo ""

gulp build
gulp test
gulp targz
echo ""

tgz="varapp-frontend-react.tar.gz"

echo "REMOTE="${REMOTE}
echo "REMOTE_DIR="${REMOTE_DIR}
echo "SETTINGS="${SETTINGS}
echo ""

ssh -t -t ${REMOTE} "mkdir -p ${REMOTE_DIR}; rm -rf ${REMOTE_DIR}/*"
scp build/${tgz} ${REMOTE}:${REMOTE_DIR}/
ssh -t -t ${REMOTE} "
    cd ${REMOTE_DIR}
    tar -xzvf ${tgz}
    cp ${SETTINGS} conf/conf.js
"


