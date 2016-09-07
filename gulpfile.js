'use strict';

/* *
 * Gulp tasks as defined in `gulp.task('taskname') {...}` will execute the code in brackets
 * when called from command-line as `gulp taskname`.
 * */
var gulp = require('gulp');

// Gulp plugins
var $ = require('gulp-load-plugins')();  // Auto-requires gulp plugins. Use with e.g. '$.uglify' for gulp-uglify.
var eslint = require('gulp-eslint');     // Alternative to jshint
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');
var react = require('gulp-react');       // To precompile JSX into Javascript
var plumber = require('gulp-plumber');   // To catch errors automatically
var uglify = require('gulp-uglify');     // JavaScript parser/compressor/beautifier
var stripDebug = require('gulp-strip-debug');  // To remove console.log statements in prod build
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
require('harmonize')();

var del = require('del');                 // To 'delete files/folders using globs'
var path = require('path');               // Path string manipulations
var browserify = require('browserify');   // To bundle 'require' dependencies:
    // browserify recursively analyzes all the require() calls in the source files you give it
    // in order to build a bundle you can serve up to the browser in a single <script> tag."
    // Return a browserify instance.
var watchify = require('watchify');           // To be able to watch changes in the code
var source = require('vinyl-source-stream')   // "Use conventional text streams at the start of your gulp pipelines,
var sourceFile = './app/scripts/app.js',      //  for nicer interoperability with the existing npm stream ecosystem."
    destFolder = './dist/scripts',
    destFileName = 'app.js';

var browserSync = require('browser-sync');  // Serve, and keep multiple browsers & devices in sync when building websites
var reload = browserSync.reload;


/*************************************************************************/
/***************         DEV: watch for changes           ****************/
/*************************************************************************/

// Read 'requires' to build a .js bundle (browserify).
// No need to define a task, just attach it to events with bundler.on like below.
var bundler = browserify(sourceFile, {  // the original 'app.js', without deps
    debug: true,          // "add a source map inline to the end of the bundle. This makes debugging easier because you can see all the original files if you are in a modern enough browser."
    insertGlobals: true,  // "always insert process, global, __filename, and __dirname without analyzing the AST for faster builds but larger output bundles."
    fullPaths: true       // "disables converting module ids into numerical indexes. This is useful for preserving the original paths that a bundle was generated with."
});
// What to do when code changed (bundler.on update, or 'script' task).
// Move the 'app.js' bundle resulting from browserify to 'dist/scripts/' and reload the browser.
function rebundle() {
    return bundler
        .bundle()
        .on('error', $.util.log.bind($.util, 'Browserify Error'))  // log errors if they happen
        .pipe(plumber())
        .pipe(source(destFileName))  // app.js bundle
        .pipe(gulp.dest(destFolder)) // dist/scripts/
        .on('end', function () {
            console.log("rebundle :: reload");
            reload();
        });
}
// Watch changes in source files, rebundle if changed
var watcher = watchify(bundler);
watcher.on('update', rebundle);
watcher.on('log', $.util.log);

// [DEV] bundle task
gulp.task('scripts_dev', rebundle);


/*************************************************************************/
/***************         Build and move sources           ****************/
/*************************************************************************/

// Browserify bundle task - without 'watchify'
// Builds 'app.js' bundle with all 'require' dependencies and moves it to dist/scripts
gulp.task('scripts', function () {
    return browserify(sourceFile)  // The original, unbundled, app.js
        .bundle()
        .pipe(plumber())
        .pipe(source(destFileName))  // The bundle with all dependencies, also 'app.js'
        //.pipe($.babel())
        //.transform("babelify", {presets: ["es2015", "react"]})
        .pipe(gulp.dest('dist/scripts'));
});

// Config files to not bundle but just copy to dest
// Since conf.js is not referenced by a 'require' anywhere, it is not bundled with browserify.
gulp.task('config', function () {
    return gulp.src(['app/conf/*.json', 'app/conf/*.js'])
        .pipe(plumber())
        .pipe(gulp.dest('dist/conf/'));
});

// Bower components
gulp.task('bower', function () {
    return gulp.src('app/bower_components/**/*.js', {
            base: 'app/bower_components'
        })
        .pipe(plumber())
        .pipe(gulp.dest('dist/bower_components/'));

});

// Styles
// Compile SASS
gulp.task('sass', function () {
    gulp.src('app/styles/img/*.svg')
        .pipe(plumber())
        .pipe(gulp.dest('dist/styles/img'));
    return gulp.src(['app/styles/**/*.scss', 'app/styles/**/*.css'])
        .pipe(plumber())
        //.pipe($.changed('dist/styles', {extension: '.css'}))  // does not work well because of @import
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            loadPath: ['app/bower_components']
        }))
        .pipe($.autoprefixer('last 1 version'))  // Automatically applies CSS prefixes such as webkit- moz- etc.
        //.pipe(concat('bundle.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());  // Log out the size of files in the stream
});
gulp.task('styles', ['sass']);

// HTML
gulp.task('html', function () {
    return gulp.src('app/*.html')
        .pipe(plumber())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe(plumber())
        .pipe($.cache($.imagemin({
        //.pipe($.imagemin({         //there was a bug with images not being copied
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        //}))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Fonts
gulp.task('fonts', function () {
    return gulp.src(require('main-bower-files')({
            filter: '**/*.{eot,svg,ttf,woff,woff2}'
        })
        .concat('app/fonts/**/*'))
        .pipe(plumber())
        .pipe(gulp.dest('dist/fonts'));
});

// JSON
gulp.task('json', function () {
    return gulp.src(['app/scripts/json/**/*.json'])
        .pipe(plumber())
        .pipe(gulp.dest('dist/scripts/'));
});

// Robots.txt and favicon.ico
gulp.task('extras', function () {
    return gulp.src(['app/*.txt', 'app/*.ico'])
        .pipe(plumber())
        .pipe(gulp.dest('dist/'))
        .pipe($.size());
});


/*************************************************************************/
/*****************         Put things together           *****************/
/*************************************************************************/

// Clear cache, remove pre-bundle dist/ directories
gulp.task('clean', function (cb) {
    $.cache.clearAll();
    del(['dist/*']).then(function() { cb(); });;
});

// [DEV] Insert CSS, JS and Bower components into the HTML
gulp.task('bundle_dev', ['styles', 'scripts_dev', 'bower'], function () {
    return gulp.src('./app/*.html')
        .pipe(plumber())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

// Insert CSS, JS and Bower components into the HTML
gulp.task('bundle', ['styles', 'scripts', 'bower'], function () {
    return gulp.src('./app/*.html')
        .pipe(plumber())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

// Syntax check with eslint
gulp.task('lint', function () {
    return gulp.src('./app/scripts/**/*.js')
        .pipe(plumber())
        .pipe(react())
        //.transform("babelify", {presets: ["es2015", "react"]})
        .pipe(eslint({
            baseConfig:{
                parser: "babel-eslint"
            }
        }))   // attaches the lint output so it can be used by other modules
        .pipe(eslint.format())  // outputs the lint results to the console
        .pipe(eslint.failAfterError());
        //.pipe(jshint({ linter: 'jsxhint' }))
        //.pipe(jshint.reporter(stylish));
});


/*************************************************************
 *************   The ones we really call on CLI  *************
 * gulp build - gulp test - gulp targz -> Our build pipeline *
 *************************************************************/

// Put all sources (HTML+JS+CSS, images, favicon, etc.) to dist/,
// then uglify the JS bundle, remove console logs, and move it to scripts/
gulp.task('build', ['html', 'json', 'config', 'bundle', 'images', 'fonts', 'extras'], function () {
    gulp.src('dist/scripts/app.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(stripDebug())
        .pipe(gulp.dest('dist/scripts'));
});

// Archive elements to distribute
gulp.task('targz', function () {
    return gulp.src(['dist/**', '!dist/bower_components/**', '!dist/bower_components'])
        .pipe(plumber())
        .pipe(tar('varapp-frontend-react.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('build'));
});

// Testing
gulp.task('test', function(done) {
    /* .... require a kind of gulp-mocha plugin */
});
gulp.task('tdd', ['test'], function(done) {
    gulp.watch([ "app/scripts/**/*.js" ], [ 'test' ]);
});

// Default task, for when one runs only 'gulp' from CLI
gulp.task('default', ['clean', 'build', 'targz']);


/***********************************************
 * Watch: tasks auto-rerunning on file changes *
 ***********************************************/

// [DEV] Serve the app locally - for development - on localhost:3000
// (reload on changes with bundle_dev task)
gulp.task('watch', ['html', 'json', 'config', 'bundle_dev', 'images', 'fonts', 'extras'], function () {
    browserSync({
        notify: false,
        logPrefix: 'BS',
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: ['dist', 'app']
    });
// Watch js files
    gulp.watch(['app/scripts/**/*.js', 'app/conf/*.js'], ['lint']);
// Watch json files
    gulp.watch('app/scripts/**/*.json', ['json']);
    //gulp.watch('app/conf/*.json', ['json']);
// Watch html files
    gulp.watch('app/*.html', ['html']);
// Watch css files
    gulp.watch(['app/styles/**/*.scss', 'app/styles/**/*.css'], ['styles', reload]);
// Watch image files
    gulp.watch('app/images/**/*', reload);
});


