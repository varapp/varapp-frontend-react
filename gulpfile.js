'use strict';

/* *
 * Gulp tasks as defined in `gulp.task('taskname') {...}` will execute the code in brackets
 * when called from command-line as `gulp taskname`.
 * */

var gulp = require('gulp');
var del = require('del');                // To 'delete files/folders using globs'

// Gulp plugins
var $ = require('gulp-load-plugins')();  // Auto-requires gulp plugins. Use with e.g. '$.uglify' for gulp-uglify.
var eslint = require('gulp-eslint');     // Alternative to jshint
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');
var react = require('gulp-react');       // To precompile JSX into Javascript
var plumber = require('gulp-plumber');   // To catch errors automatically
var uglify = require('gulp-uglify');     // JavaScript parser/compressor/beautifier
var stripDebug = require('gulp-strip-debug');  // To remove console.log statements in prod build
require('harmonize')();

var path = require('path');               // Path string manipulations
var browserify = require('browserify');   // To use `require` and bundle dependencies
var watchify = require('watchify');       // To be able to watch changes in the code
var source = require('vinyl-source-stream'),  // "Use conventional text streams at the start of your gulp pipelines,
    sourceFile = './app/scripts/app.js',      // for nicer interoperability with the existing npm stream ecosystem."
    destFolder = './dist/scripts',
    destFileName = 'app.js';

var browserSync = require('browser-sync');  // Serve, and keep multiple browsers & devices in sync when building websites
var reload = browserSync.reload;

// Styles
gulp.task('styles', ['sass']);
gulp.task('sass', function () {
    return gulp.src(['app/styles/**/*.scss', 'app/styles/**/*.css'])
        .pipe(plumber())
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            loadPath: ['app/bower_components']
        }))
        .pipe($.autoprefixer('last 1 version'))  // Automatically applies CSS prefixes such as webkit- moz- etc.
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());
});


// Scripts
function rebundle() {
    return bundler.bundle()
        // log errors if they happen
        .on('error', $.util.log.bind($.util, 'Browserify Error'))
        .pipe(plumber())
        .pipe(source(destFileName))
        .pipe(gulp.dest(destFolder))
        .on('end', function () {
            reload();
        });
}

var bundler = watchify(browserify({
    entries: [sourceFile],
    debug: true,
    insertGlobals: true,
    cache: {},
    packageCache: {},
    fullPaths: true
}));

bundler.on('update', rebundle);
bundler.on('log', $.util.log);

gulp.task('scripts', rebundle);

gulp.task('buildScripts', function () {
    return browserify(sourceFile)
        .bundle()
        .pipe(plumber())
        .pipe(source(destFileName))
        //.pipe($.babel())
        .pipe(gulp.dest('dist/scripts'));
});

// Bower helper
gulp.task('bower', function () {
    gulp.src('app/bower_components/**/*.js', {
        base: 'app/bower_components'
    })
    .pipe(plumber())
    .pipe(gulp.dest('dist/bower_components/'));

});

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
    }).concat('app/fonts/**/*'))
        .pipe(plumber())
        .pipe(gulp.dest('dist/fonts'));
});

// Clean
gulp.task('clean', function (cb) {
    $.cache.clearAll();
    cb(del.sync(['dist/styles', 'dist/scripts', 'dist/images']));
});


// Bundle
gulp.task('bundle', ['styles', 'scripts', 'bower'], function () {
    return gulp.src('./app/*.html')
        .pipe(plumber())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('buildBundle', ['styles', 'buildScripts', 'bower'], function () {
    return gulp.src('./app/*.html')
        .pipe(plumber())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

//gulp.task('json', function () {
//    gulp.src('app/scripts/json/**/*.json', {
//        base: 'app/scripts'
//    })
//        .pipe(plumber())
//        .pipe(gulp.dest('dist/scripts/'));
//});

// Robots.txt and favicon.ico
gulp.task('extras', function () {
    return gulp.src(['app/*.txt', 'app/*.ico'])
        .pipe(plumber())
        .pipe(gulp.dest('dist/'))
        .pipe($.size());
});

// Syntax check with eslint
gulp.task('lint', function () {
    return gulp.src('./app/scripts/**/*.js')
        .pipe(plumber())
        .pipe(react())
        .pipe(eslint())   // attaches the lint output so it can be used by other modules
        .pipe(eslint.format())  // outputs the lint results to the console
        .pipe(eslint.failAfterError());
        //.pipe(jshint({ linter: 'jsxhint' }))
        //.pipe(jshint.reporter(stylish));
});


/****************************************************
 * build - test - targz -> Our 'build' Jenkins task *
 ****************************************************/


// Build
gulp.task('build', ['html', 'buildBundle', 'images', 'fonts', 'extras'], function () {
    gulp.src('dist/scripts/app.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(stripDebug())
        .pipe(gulp.dest('dist/scripts'));
});

// Testing
gulp.task('test', function(done) {
    /* .... require a kind of gulp-mocha plugin */
});
gulp.task('tdd', ['test'], function(done) {
    gulp.watch([ "app/scripts/**/*.js" ], [ 'test' ]);
});


// Archive elements to distribute
gulp.task('targz', function () {
    return gulp.src(['dist/**', '!dist/bower_components/**', '!dist/bower_components'])
        .pipe(plumber())
        .pipe(tar('varapp-browser-react.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('build'));
});



/***********************************************
 * Watch: tasks auto-rerunning on file changes *
 ***********************************************/


// Serve the app locally - for development - on localhost:3000 - reload on changes
gulp.task('watch', ['html', 'fonts', 'bundle'], function () {
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
    gulp.watch('app/scripts/**/*.js', ['lint']);
// Watch json files
    //gulp.watch('app/scripts/**/*.json', ['json']);
// Watch html files
    gulp.watch('app/*.html', ['html']);
// Watch css files
    gulp.watch(['app/styles/**/*.scss', 'app/styles/**/*.css'], ['styles', reload]);
// Watch image files
    gulp.watch('app/images/**/*', reload);
});


// Default task
gulp.task('default', ['clean', 'build', 'targz']);
