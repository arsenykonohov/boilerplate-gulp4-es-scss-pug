//export PATH=./node_modules/.bin:$PATH
//process.env.NODE_ENV = "production";
// http://macr.ae/article/gulp-and-babel.html
// https://www.barbarianmeetscoding.com/blog/2016/02/21/start-using-es6-es2015-in-your-project-with-babel-and-gulp/
// https://github.com/babel/gulp-babel
// https://gist.github.com/Fishrock123/8ea81dad3197c2f84366
// https://gist.github.com/danharper/3ca2273125f500429945


const path = require("path");
const del = require("del");
const gulp = require("gulp");

const sass = require("gulp-sass");
const csscomb = require("gulp-csscomb");
const minCss = require("gulp-cssnano");
const cssBeautify = require("gulp-cssbeautify");
const autoprefixer = require("gulp-autoprefixer");

const imageMin = require("gulp-imagemin");

const minJs = require("gulp-uglify");
const jsBeautify = require("gulp-beautify");

const gulpIf = require("gulp-if");
const print = require("gulp-print");
const debug = require("gulp-debug");
const sMaps = require("gulp-sourcemaps");
const newer = require("gulp-newer"); // we have to use this plugin without delitions in start of your build

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "developer";

const babel = require('gulp-babel');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const browserSync = require("browser-sync").create();

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("isDev:", isDev);







// =====================================================================
function isImages(f) {
    return f.extname === ".jpg" || f.extname === ".jpeg" || f.extname === ".png" ? true : false;
}

// https://github.com/BrowserSync/browser-sync/issues/392
let svConfig = {
    server: {
        baseDir: "./public/"
    },
    files: ["./public/**/*.*"],
    reloadDelay: 1000,
    host: "localhost",
    tunnel: false,
    port: 9000
};




// =====================================================================
gulp.task("html", function () {
    return gulp.src("./_source/*.html", {buffer:false})
        .pipe(gulp.dest("./public"));
});

gulp.task("scripts", function (cb) {
    let bundler = browserify({
        entries: "./_source/index.js",
        debug: true
    }).transform(babelify).bundle()
        //.pipe(babel())
        .on("error", function (e) {
            console.log("\n================================");
            console.log(e);
            console.log("================================\n");
        })
        .pipe(source("bundle.js"))
        .pipe(buffer())
        .pipe(gulpIf(isDev, sMaps.init()))
        //.pipe(minJs())
        .pipe(gulpIf(isDev, sMaps.write()))
        .pipe(gulp.dest("./public/scripts/"));
    cb();
});

gulp.task("styles", function () {
    return gulp.src("./_source/style.scss")
        .pipe(gulpIf(isDev, sMaps.init()))
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ["last 5 versions"],
            cascade: false
        }))
        .pipe(csscomb())
        .pipe(gulpIf(isDev, cssBeautify(), minCss()))
        .pipe(gulpIf(isDev, sMaps.write()))
        .pipe(gulp.dest("./public/style"))
        .pipe(browserSync.stream());
});

gulp.task("assets", function () {
    return gulp.src("_source/assets/**/*.{svg,jpg,woff,woff2,ttf,eot,png,gif,jpg,jpeg}",
        {
            //buffer:false,
            since: gulp.lastRun("assets"),
            base:"_source"
        })
        .pipe(gulpIf(isImages, imageMin()))
        //.pipe(debug({title: "assets"}))
        //.pipe(newer("./public"))
        .pipe(gulp.dest("./public"));
});







// =====================================================================
gulp.task("w", function (cb) {
    browserSync.init(svConfig);

    if (isDev) {
        let assetsWatcher = gulp.watch("./_source/assets/**/*.*", gulp.series("assets"));
        assetsWatcher.on("unlink", function (fp) {
            let fpSrc = path.relative(path.resolve("_source"), fp);
            let fpPub = path.resolve("public", fpSrc);
            del.sync(fpPub);
        });

        gulp.watch("./_source/**/*.scss", gulp.series("styles"));
        gulp.watch("./_source/**/*.js",   gulp.series("scripts"));
        gulp.watch("./_source/**/*.html", gulp.series("html"));

        browserSync.watch("./public/**/*.*").on('change', browserSync.reload);
    } else {
        console.log("production");
        cb();
    }
});

gulp.task("c", function () {
    return del("./public/*");
});

gulp.task("b", gulp.parallel("html", "styles", "scripts", "assets"));

gulp.task("default", gulp.series("c", "b", "w"));










// =====================================================================
// resolve path in to gulp.dest(pathResolver);
function pathResolver(f) {
    console.log(typeof f.extname, "-", f.extname);
    return f.extname === ".js" ? "./public/script" : f.extname === ".scss" ? "./public/style" : "./public/assets";
}

// example: pipe(gulpIf(gulpIfScript, sMap.init()))
function gulpIfScript(f) {
    return f.extname === ".js"; // have to return true to apply next arg-pipe;
}

// check pipe via .on("data", vinylData):
function vinylData(f) {
    console.log(
        "=======================", "\n",
        //"contents:\t", f.contents, "\n",
        "path:\t\t",   f.path,     "\n",
        "cwd:\t\t",    f.cwd,      "\n",
        "base:\t\t",   f.base,     "\n",
        "relative:\t", f.relative, "\n",
        "dirname:\t",  f.dirname,  "\n",
        "basename:\t", f.basename, "\n",
        "stem:\t\t",   f.stem,     "\n",
        "extname:\t",  f.extname,  "\n"
    );
}



// =====================================================================
// gulp.src avaliable options:
let options = {
    read: true,   // default
    buffer: true, // default
    base: "" // here path to you source
}

//gulp.watch("./_source/**/*.js",   gulp.series("scripts")).on('change', reload);
//gulp.watch("./_source/**/*.html", gulp.series("html")).on('change', reload);

//gulp.task("move", function () {
//    return gulp.src("./_source/**/*.{js,scss}", {read: false}) // these patterns resolved by "minimathc" module
//        //.on("data", vinylData)
//        //.pipe(gulp.dest("./public/moved"));
//        .pipe(gulp.dest(pathResolver));
//});

//gulp.series("sass", function () {
//    gulp.watch("./_source/style/*.scss", gulp.series("sass"));
//});