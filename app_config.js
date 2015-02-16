exports.config = {
  debug: true,
  name: 'stormmail',
  description: 'email and stats',
  version: '0.0.1',

  mailHost: 'startupstorm.club',
  imapPort: 993,
  useTLS: true, 
  smtpPort: 465,

  sessionSecret: 'storming',
  authCookieName: 'storming',
  host: '127.0.0.1',
  port: 3000,

  db: 'mongodb://127.0.0.1/nodemail',

  pgDB : 'postgres://db_admin:db_pass@localhost:5432/stormmail_dev'
};

