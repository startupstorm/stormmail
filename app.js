var path = require('path');
var markdown = require('markdown-js');
var partials = require('express-partials');
var ejs = require('ejs');
var fs = require('fs');
var express = require('express');
var app = express();
var sign = require('./controllers/sign');
var config = require('./config').config;
var routes = require('./routes');
var appRoot = './';

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
  app.use(express.cookieParser());
  app.use(express.session({secret: config.sessionSecret}));
  app.use(sign.authUser);
  app.use(sign.toobusy);
  app.use(partials());
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
app.listen(config.port);
console.log(config.host + ':' + config.port);
