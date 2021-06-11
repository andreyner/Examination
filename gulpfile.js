const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const terser = require("gulp-terser");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const sync = require("browser-sync").create();
const concat = require('gulp-concat');

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;
// Clean

const clean = () => {
  return del("build");
};

// HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

// Scripts

const scripts = () => {
  return gulp.src(['source/js/utils.js', 'source/js/model.js', 'source/js/game.js', 'source/js/chart.js'])
    .pipe(terser())
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}
// Copy

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/img/**/*.svg",
    "!source/img/icons/*.svg",
    "source/manifest.webmanifest"
  ], {
    base: "source"
  }).pipe(gulp.dest("build"))
  done();
}
// Build

const build = gulp.series(
  clean,
  copy,
  gulp.parallel(
    styles,
    html,
    scripts
  ),
);

exports.build = build;

// Default


exports.default = gulp.series(
  copy,
  gulp.parallel(
    styles,
    html,
    scripts
  ),
  gulp.series(
    server,
    watcher
  ));
