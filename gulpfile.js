let gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    less = require('gulp-less');

const cssUrl = {
    src: 'less/**/*.less',
    dist: 'pages'
}

gulp.task('less', function () {
    return gulp.src(cssUrl.src)  //找到需要编译的less文件
        .pipe(plumber({errorHandler: notify.onError('Error:<%= error.message %>;')}))  //如果less文件中有语法错误，用notify插件报错，用plumber保证任务不会停止
        .pipe(less())  //如果没错误，就编译less
        .pipe(rename(function (path) {
            path.extname = ".wxss"
        }))
        .pipe(gulp.dest(cssUrl.dist));  //把css文件放到css文件夹下
});

gulp.task("start", ['less'], function () {
    gulp.watch(cssUrl.src, ['less']);
    console.log('开始监听less/sass');
});
