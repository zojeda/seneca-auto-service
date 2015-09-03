'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var ignore = require('gulp-ignore');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var plumber = require('gulp-plumber');

var src = [ 'src/**/*.js' ];
var srcOption = { base: './' };
var dest = './dist';


gulp.task('clean', function () {
    return gulp.src(dest, {read: false})
        .pipe(clean());
});


gulp.task('babel', ['clean'], function () {
    return gulp.src(src, srcOption)
        .pipe(sourcemaps.init())
        .pipe(babel({ optional: ["es7.decorators"] }))
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '..' }))
        .pipe(gulp.dest(dest));
});


gulp.task('pre-test', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel({ optional: ["es7.decorators"] }))
    .pipe(istanbul({includeUntested: false}))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function (cb) {
  var mochaErr;
  var chai = require('chai');

  var sinonChai = require("sinon-chai");
  chai.use(sinonChai);
  gulp.src('src/**/*.spec.js')
    .pipe(plumber())
    .pipe(mocha({
      reporter: 'spec',
      require: {
        chai: chai
      },
      globals: {
        chai: chai,
        assert: require('assert'),
        should: chai.should()
      }
    }))
    .on('error', function (err) {
      mochaErr = err;
      //console.error(err);
    })
    .pipe(istanbul.writeReports())
    .on('end', function () {
      cb(mochaErr);
    });
});

gulp.task('watch-mocha', function() {
    gulp.watch(['src/**'], ['test']);
})
