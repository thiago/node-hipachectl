var gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  jshint = require('gulp-jshint'),
  watch = require('gulp-watch'),
  stylish = require('jshint-stylish'),
  gutil = require('gulp-util');

gulp.task('lint', function () {
  'use strict';
  return gulp.src(['lib/**/*.js', 'tests/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['lint'], function () {
  'use strict';
  return gulp.src(['tests/*.js'])
    .pipe(mocha({bail: true}))
    .on('error', gutil.log);
});

gulp.task('watch', function () {
  'use strict';
  gulp.watch(['gulpfile.js', 'lib/**', 'tests/**'], ['lint', 'test']);
});
