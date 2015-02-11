// var path = require('path');
exports.config = {
  debug: true,
  name: 'nodemail',
  description: 'email and stats',
  version: '0.1.7',

  sessionSecret: 'stormmail',
  authCookieName: 'stormmail',
  host: '127.0.0.1',
  port: 3001,

  db: 'mongodb://127.0.0.1/nodemail'
};
