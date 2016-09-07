# Varapp-browser-react

This is the ReactJS web interface from Varapp.

## Development notes

#### Build from source

    sudo yum -y install nodejs
    sudo npm install npm -g
    sudo gem install sass   # requires Ruby

    npm install -g gulp
    npm install -g bower

Once the code is checked out, install dependencies:

    npm install
    bower install

#### Start local

    gulp watch

And head to http://localhost:3000

#### Build & deploy

Build a local distrib tar.gz archive in  `build/`, ready to be shipped!

    gulp build
    gulp targz

