/// <binding AfterBuild='default' Clean='clean' />
/*
This file is the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var del = require('del');
var ts = require('gulp-typescript');
var sass = require('gulp-sass');
var watch = require('gulp-watch');

var paths = {
	scripts: ['scripts/**/*.js', 'scripts/**/*.ts', 'scripts/**/*.map'],
	styles: ['styles/**/*.css', 'styles/**/*.scss']
};

gulp.task('clean', function () {
	return del([
		'wwwroot/scripts/**/*',
		'wwwroot/styles/**/*'
	]);
});

gulp.task('watch', function () {
	gulp.watch(paths.scripts.concat(paths.styles), [
		'tp-ts',
		'tp-sass'
	]);
});

gulp.task('tp-ts', function () {
	gulp
		.src(paths.scripts)
		.pipe(ts({
            noImplicitAny: true,
            out: 'app.js'
        }))
		.pipe(gulp.dest('wwwroot/scripts'));
});

gulp.task('tp-sass', function () {
	gulp
		.src(paths.styles)
		.pipe(sass())
		.pipe(gulp.dest('wwwroot/styles'));
});
