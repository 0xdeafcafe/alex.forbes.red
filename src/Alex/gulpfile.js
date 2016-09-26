/// <binding Clean='clean' />
"use strict";

var gulp = require("gulp"),
	rimraf = require("rimraf"),
	concat = require("gulp-concat"),
	cssmin = require("gulp-cssmin"),
	uglify = require("gulp-uglify"),
	sass = require("gulp-sass");

var webroot = "./wwwroot/";

var paths = {
	js: webroot + "js/**/*.js",
	jsDest: webroot + "js",
	minJs: webroot + "js/**/*.min.js",

	sass: "./Content/Sass/site.scss",
	sassFiles: "./Content/**/*.scss",

	css: webroot + "css/**/*.css",
	cssDest: webroot + "css",
	minCss: webroot + "css/**/*.min.css",

	concatJsDest: webroot + "js/site.min.js",
	concatCssDest: webroot + "css/site.min.css",
};

gulp.task("clean:js", function (cb) {
	rimraf(paths.concatJsDest, cb);
});
gulp.task("clean:css", function (cb) {
	rimraf(paths.concatCssDest, cb);
});

gulp.task("min:js", function () {
	return gulp.src([paths.js, "!" + paths.minJs], { base: "." })
		.pipe(concat(paths.concatJsDest))
		.pipe(uglify())
		.pipe(gulp.dest("."));
});
gulp.task("min:css", function () {
	return gulp.src([paths.css, "!" + paths.minCss])
		.pipe(concat(paths.concatCssDest))
		.pipe(cssmin())
		.pipe(gulp.dest("."));
});

gulp.task("compile:sass", function () {
	return gulp.src(paths.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(paths.cssDest));
});
gulp.task("watch:sass", function () {
	gulp.watch(paths.sassFiles, ["compile:sass"]);
});

gulp.task("min", ["min:js", "min:css"]);
gulp.task("compile", ["compile:sass"]);
gulp.task("watch", ["watch:sass"]);
gulp.task("clean", ["clean:js", "clean:css"]);
