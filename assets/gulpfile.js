const {series, parallel, watch, dest, src } = require('gulp');
const babel  = require('gulp-babel');
const log = require('fancy-log');
const rename = require("gulp-rename");


function javascript(cb) {
 // use later
  cb();
}

function css(cb) {
  
  cb();
}

function copy(cb) {
  log('Starting JS');
  src('src/admin/taxonomy-editor/public/build/bundle.js')
    .pipe(rename('taxonomy-editor.js'))
    .pipe(dest('dist/admin/'))
  
  src('src/admin/taxonomy-editor/public/build/bundle.js.map')
    .pipe(rename('taxonomy-editor.js.map'))
    .pipe(dest('dist/admin/'))
    log('Starting css');

    src('src/admin/taxonomy-editor/public/build/bundle.css')
    .pipe(rename('taxonomy-editor.css'))
    .pipe(dest('dist/admin/'))

    cb();
}

function defaultTask(cb){
  log('Starting Default Task');
  series(javascript, css);
  watch('src/admin/taxonomy-editor/public/build/*.*', copy);
  
  cb();
}

exports.default = series(defaultTask);
exports.build = series(copy);
