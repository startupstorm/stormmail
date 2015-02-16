var path = require('path');
var markdown = require('markdown-js');
var partials = require('express-partials');
var ejs = require('ejs');
var fs = require('fs');
var express = require('express');
var app = express();
var sign = require('./controllers/sign');
var config = require('./app_config').config;
var routes = require('./routes');
var expressValidator = require('express-validator');
var appRoot = './';
var passport = require('passport');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var http = require('http');

/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

app.configure('development', function() {
  app.set('views', path.join(appRoot, 'views'));
  app.set('views engine', 'html');
  app.set('view cache', false);
  app.engine('html', ejs.renderFile);
  app.engine('md', function(path, options, fn) {
    fs.readFile(path, 'utf8', function(err, str) {
      if (err) return fn(err);
      str = markdown.parse(str).toString();
      fn(null, str);
    });
  });

  app.use(express.bodyParser());
  app.use(expressValidator([]));
  app.use(express.cookieParser());
  // app.use(express.session({secret: config.sessionSecret}));
  // app.use(sign.authUser);
  // app.use(sign.toobusy);
  app.use(flash());
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secrets.sessionSecret,
    store: new MongoStore({ url: secrets.db, autoReconnect: true })
  }));
  app.use(partials());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(path.join(appRoot, 'public')));
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

// set static, dynamic helpers
app.locals({
  config: config,
  csrf: function(req, res) {
    return req.session ? req.session._csrf : '';
  }
});
routes(app);
// app.listen(config.port);
// console.log(config.host + ':' + config.port);

// app is a callback function or an express application
module.exports = app;
if (!module.parent) {
  http.createServer(app).listen(config.port, function(){
    console.log("Server listening on port " + config.port);
  });
}
