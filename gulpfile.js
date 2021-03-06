
'use strict';

// -------------------------------------
//   devDependencies
// -------------------------------------

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const cssnano = require('gulp-cssnano');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');

// --------------------------------------------
//  Error message
// --------------------------------------------

const onError = function(err) {
	notify.onError({
		title: "Gulp",
		subtitle: "FAIL!!!",
		message: "Error: <%= error.message %>",
		sound: "Beep"
	})(err);
	this.emit('end');
};

// --------------------------------------------
//  Task: compile, minify, autoprefix sass/scss
// --------------------------------------------
gulp.task('styles', function() {
	return gulp.src('dev/sass/*.{sass,scss}')
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(autoprefixer({
			browsers: ['last 5 versions', 'ie 8', 'ie 9', '> 1%'],
			cascade: false
		}))
		.pipe(gulp.dest('public/css/'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(cssnano())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('public/css/'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: compile Jade to HTML
// --------------------------------------------

gulp.task('jade', function() {
	return gulp.src('dev/templates/**/!(_)*.jade')
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(jade({
			pretty: '  '
		}))
		.pipe(gulp.dest('public'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Minify, concat JavaScript files
// --------------------------------------------

gulp.task('scripts', function() {
	return gulp.src(['dev/js/**/*.js', '!dev/js/lib/**'])
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(concat('main.min.js'))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(gulp.dest('public/js'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Minify, concat JavaScript Lib files
// --------------------------------------------

gulp.task('libScripts', function() {
	return gulp.src('dev/js/lib/**')
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(concat('lib.min.js'))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(gulp.dest('public/js/lib'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Move font files to public
// --------------------------------------------

gulp.task('fonts', function() {
	return gulp.src('dev/fonts/**/*.{ttf,woff,eot,svg,otf}')
		.pipe(gulp.dest('public/fonts'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Creating sprites
// --------------------------------------------

gulp.task('sprites', function() {
	var spriteData = gulp.src('dev/img/sprites/*.{png,jpg}')
		.pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: '_sprite.scss',
			imgPath: '../img/sprite.png',
			cssFormat: 'scss',
			padding: 4,
			cssTemplate: 'dev/scss.template.mustache'
		}));
	var imgStream = spriteData.img
		.pipe(gulp.dest('public/img/'));
	var cssStream = spriteData.css
		.pipe(gulp.dest('dev/sass/'));
	return merge(imgStream, cssStream)
	.pipe(browserSync.reload({
			stream: true
		}));

});

// --------------------------------------------
//  Task: Move images to public
// --------------------------------------------

gulp.task('images', function() {
	return gulp.src(['dev/img/**', '!dev/img/{sprites,sprites/**}'])
		.pipe(gulp.dest('public/img'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Browser reload
// --------------------------------------------

gulp.task('bs-reload', function() {
	browserSync.reload();
});

// --------------------------------------------
//  Task: Deleting public
// --------------------------------------------

gulp.task('clean', function() {
	return del('public');
});

// --------------------------------------------
//  Task: Watch
// --------------------------------------------

gulp.task('watch', function() {
	gulp.watch('dev/sass/**/*.*', gulp.series('styles'));
	gulp.watch('dev/templates/**/*.*', gulp.series('jade'));
	gulp.watch(['dev/js/**/*.js', '!dev/js/lib/**'], gulp.series('scripts'));
	gulp.watch('dev/js/lib/**', gulp.series('libScripts'));
	gulp.watch('dev/img/sprites/*.{png,jpg}', gulp.series('sprites'));
	gulp.watch(['dev/img/**/*', '!dev/img/{sprites,sprites/**}'], gulp.series('images'));
	gulp.watch('dev/fonts/**/*.{ttf,woff,eot,svg,otf}', gulp.series('fonts'));
});

// --------------------------------------------
//  Task: Build
// --------------------------------------------

gulp.task('build', gulp.series(
	'clean',
	gulp.parallel('styles', 'jade', 'scripts', 'fonts', 'sprites', 'images')));

// --------------------------------------------
//  Task: Basic server
// --------------------------------------------

gulp.task('server', function() {
	browserSync.init({
		server: 'public'
	});
});

// --------------------------------------------
//  Task: Development
// --------------------------------------------

gulp.task('dev',
	gulp.series('build', gulp.parallel('watch', 'server'))
);