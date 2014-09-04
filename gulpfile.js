var gulp = require('gulp'),
    webserver = require('gulp-webserver');

gulp.task('webserver', function() {
    gulp.src('./')
        .pipe(webserver({
            livereload: true,
            fallback: 'index.html',
            open: true
        }));
});

gulp.task('default', ['webserver']);
