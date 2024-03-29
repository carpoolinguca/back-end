var express = require('express');
var path = require('path');
var morgan = require('morgan'); // HTTP request logger middleware
var bodyParser = require('body-parser');
var qt = require('quickthumb');
var sequelize = require('./sequelizeConfigured');

var routes = require('./routes/index');
var users = require('./routes/users')(sequelize);
var travels = require('./routes/travels')(sequelize);
var complaints = require('./routes/complaints')(sequelize);
var reviews = require('./routes/reviews')(sequelize);
var contacts = require('./routes/contacts')(sequelize);
var photos = require('./routes/photos')(sequelize);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(morgan('combined')); //Para desarrollo en vez de 'combined' puede usarse 'dev'.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
//app.use(express.static(path.join(__dirname, 'public')));

// Use quickthumb
//app.use(qt.static(__dirname + '/'));

sequelize.sync();

app.use('/', routes);
app.use('/users', users);
app.use('/travels', travels);
app.use('/complaints', complaints);
app.use('/reviews', reviews);
app.use('/contacts', contacts);
app.use('/photos', photos);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
/*
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
*/

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;