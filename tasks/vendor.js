import gulp from 'gulp'
import gulpif from 'gulp-if'
import livereload from 'gulp-livereload'
import args from './lib/args'

gulp.task('vendor', () => {
  return gulp.src('app/vendor/**/*.js')
    .pipe(gulp.dest(`dist/${args.vendor}/vendor`))
    .pipe(gulpif(args.watch, livereload()))
})
