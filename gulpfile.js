/* pug周りを横着したせいで、
   頭にアンダーバーがついたpugファイルはwatchタスクさえ追ってくれない
   言わずもがなだがどっかでどっかーに替えるべき。Dockerコンテナでnodeを動かしてそっちでこのファイルを使うのが理想かな　*/

   const gulp = require('gulp');
   const pug = require("gulp-pug");
   const sass = require('gulp-sass');
   const notify = require('gulp-notify');
   const plumber = require('gulp-plumber');
   const browserSync =require('browser-sync');

   // 各種変数
   const src = {
     // ROUTE
     route: './src/dist',
     // IMAGE ROUTE
     img_route: './src/dist/images',
     // JS ROUTE
     js_route: './src/dist/js',
     // SCSSの格納先
     scss: './src/scss/**/*.scss',
     // JSの格納先
     js: './src/js/**/*.js',
     // PUGの格納先: 後々PHPにすることを考えてコンポーネントもHTMLとして出力する
     pug: './src/pug/**/*.pug',
     // 画像の格納先
     image: './src/images/**/*'
   };

   // scssのコンパイル
   gulp.task('scss', () => {
     return gulp
       .src(src.scss)
       .pipe(plumber({
         errorHandler: notify.onError("Scss Error: <%= error.message %>")
       }))
       .pipe(sass({
         outputStyle: 'compressed'
       }))
       .pipe(gulp.dest(src.route));
   });

   // Pugのコンパイル
   gulp.task('pug', () => {
     return gulp
       .src(src.pug)
       .pipe(plumber({
           errorHandler: notify.onError("Pug Error: <%= error.message %>")
         }))
       .pipe(pug({
         pretty: true
       }))
       .pipe(gulp.dest(src.route));
   });

   // JSのコピー 本当なら最適化したいがほぼテスト用なので良しとする
   gulp.task('js', () => {
     return gulp
       .src(src.js)
       .pipe(gulp.dest(src.js_route));
   });

   // Imageコピー ほんとなら最適化したいがほぼテストなので（ry
   gulp.task('image', () => {
     return gulp
       .src(src.image)
       .pipe(gulp.dest(src.img_route));
   });

   // Scssコピー distディレクトリからthemesディレクトリへ
   gulp.task('scss-copy', () => {
     return gulp
       .src('./src/dist/style.css')
       .pipe(gulp.dest('./themes/ocr/'));
   });

   // Watchタスク
   gulp.task('watch', () => {
     gulp.watch(src.pug, gulp.series('pug', 'bs-reload'));
     gulp.watch(src.scss, gulp.series('scss', 'scss-copy', 'bs-reload'));
     gulp.watch(src.js, gulp.series('js', 'bs-reload'));
     gulp.watch(src.image, gulp.series('image', 'bs-reload'));
   });

   // browser-sync
   gulp.task('browser-sync', (done) => {
     browserSync.init({
       port: 3000,
       server: {
         baseDir: src.route,
         index: 'index.html',
       },
       reloadOnRestart: true,
     });
     done();
   },)

   // reload
   gulp.task('bs-reload', (done) => {
     browserSync.reload();
     done();
   });

   // Gulpコマンド
   gulp.task('default',
     gulp.series(
       gulp.parallel('scss', 'pug', 'js', 'image'),
       gulp.series('browser-sync', 'watch')
     )
   );

   // Buildコマンド
   gulp.task('build',
     gulp.parallel('scss', 'pug', 'js', 'image')
   );
