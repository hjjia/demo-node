var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var setting = require('./setting');
//var users = require('./routes/users');

var flash = require('connect-flash');

var app = express();

// view engine setup
app.set('port', process.env.PORT || 3000);
// 设置views文件夹为存放视图文件的目录，即存放模板文件的地方
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

// 加载解析json的中间件
app.use(bodyParser.json());

// 加载解析urlencoded请求体的中间件
app.use(bodyParser.urlencoded({ extended: false }));

// 加载解析cookie的中间件
app.use(cookieParser());

// 设置public文件夹为存放静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));


// 路由控制
routes(app);
//app.use('/', routes);
//app.use('/users', users);

app.listen(app.get('port'), function() {
  console.log('Express server is listenning on port ' + app.get('port'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app.use(session({
  secret: setting.cookieSecret,
  key: setting.db,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, // 30 day
  store: new MongoStore({
    db: setting.db,
    host: setting.host,
    port: setting.port,
    url:'mongodb://localhost/blog' //要加一个url
  })
}));

module.exports = app;
