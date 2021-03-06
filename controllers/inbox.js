var util = require('util');
var mailUtil = require('../libs/mail-util');
var cache = require('lru-cache')({max: 100});
var fs = require('fs');
var MailParser = require('mailparser').MailParser;
var moment = require('moment');
var emitter = new (require('events').EventEmitter)();

var cb = mailUtil.cb;
var imap, mailObject = {};

var inboxPage;

emitter.setMaxListeners(1000);
moment.lang('en');

emitter.on('messages', function(res) {
  mailObject.msgs = mailObject.msgs.reverse();
  console.log(mailObject)
  res.json({
    status: 'success',
    data: mailObject
  });
//  console.log('Done fetching all messages!');
// imap.logout(cb);
});

exports.index = function(req, res) {
  if (req.session.user) {
    var page = inboxPage = req.params.page || 1;
    res.locals({'tag': 'inbox', 'page': page});
    res.render('mail/list.html');
  } else {
    res.redirect('/login');
  }
};

exports.flagged = function(req, res) {
  if (req.session.user) {
    res.locals({'tag': 'flagged'});
    res.render('mail/list.html');
  } else {
    res.redirect('/login');
  }
};

exports.seen = function(req, res) {
  if (req.session.user) {
    res.locals({'tag': 'seen'});
    res.render('mail/list.html');
  } else {
    res.redirect('/login');
  }
};

exports.unseen = function(req, res) {
  if (req.session.user) {
    res.locals({'tag': 'unseen'});
    res.render('mail/list.html');
  }
  else {
    res.redirect('/login');
  }
};

exports.deleted = function(req, res) {
  if (req.session.user) {
    res.locals({'tag': 'deleted'});
    res.render('mail/list.html');
  } else {
    res.redirect('/login');
  }
};

exports.answered = function(req, res) {
  if (req.session.user) {
    res.locals({'tag': 'answered'});
    res.render('mail/list.html');
  } else {
    res.redirect('/login');
  }
};

exports.draft = function(req, res) {
  if (req.session.user) {
    res.locals({'tag': 'draft'});
    res.render('mail/list.html');
  } else {
    res.redirect('/login');
  }
};

exports.box = function(req, res) {
  if (req.session.user) {
    res.locals({'tag': 'box'});
    res.locals({'box': req.params.box});
    res.render('mail/list.html');
  } else {
    res.redirect('/login');
  }
};

exports.getAll = function(req, res) {
  _getMail(req, res, {type: 'ALL'});
};

exports.getFlagged = function(req, res) {
  _getMail(req, res, {type: 'FLAGGED'});
};

exports.getSeen = function(req, res) {
  _getMail(req, res, {type: 'SEEN'});
};

exports.getUnseen = function(req, res) {
  _getMail(req, res, {type: 'UNSEEN'});
};

exports.getDeleted = function(req, res) {
  _getMail(req, res, {type: 'DELETED'});
};

exports.getAnswered = function(req, res) {
  _getMail(req, res, {type: 'ANSWERED'});
};

exports.getDraft = function(req, res) {
  _getMail(req, res, {type: 'DRAFT'});
};

exports.getBoxMail = function(req, res) {
  var box = req.params.box;
  _getMail(req, res, {box: box});
};

exports.getById = function(req, res) {
  if (req.session.user) {
    var id = req.params.id,
      page = req.params.page || 1;
    if (id !== '') {
      mailUtil.getMailById(id, function(mail) {
        res.locals({
          'id': id,
          'page': page,
          'tag': 'mail',
          'moment': moment,
          'data': mail.data
        });
        res.render('mail/mail.html');
      });
    }
  } else {
    res.redirect('/login');
  }
};

exports.getHtml = function(req, res) {
  if (req.session.user) {
    var id = req.params.id;
    if (id !== '') {
      mailUtil.getMailById(id, function(mail) {
        var html = mail.data.mail.html || mail.data.mail.text;
        res.locals({'html': html});
        res.render('mail/content.html', {layout: false});
      });
    }
  }
};

exports.addFlags = function(req, res) {
  var id = req.params.id,
    flag = req.params.flag.toUpperCase();
  if (id && flag) {
    // TODO flag for 'deleted' when successful, but 'deleted' mail cannot be accessed
    imap.addFlags(id, flag, function(err) {
      if (err) throw err;
      res.json({'success': true});
    });
  }
};

function _getMail(req, res, options) {
  var user = req.session.user,
    type = options.type,
    box = options.box;

//  if (inboxPage > 1 || type != 'ALL') {
    imap = mailUtil.getConnection(user);
    imap.on('error', function(err) {
      if (err) throw err;
    });

    mailUtil.setHandlers([
//      _connect,
      _getBoxes,
      function() {
        _openBox(box);
      },
      function(results) {
        _search(results, type);
      },
      function(results) {
        _fetch(results, req, res);
      }
    ]);
      cb();


//  } else {
//    mailUtil.getMailListByPage(1, function(list) {
//      mailObject.msgs = [];
//      list.forEach(function(l) {
//        mailObject.msgs.push(l.data);
//      });
//      emitter.emit('messages', res);
//    });
//  }
}

//function _connect() {
//  imap.connect(cb);
//}

function _getBoxes() {
  if (cache.get('boxes')) {
    cb();
  } else {
    mailUtil.getBoxes(imap, function(boxes) {
      cache.set('boxes', mailObject.boxes = boxes);
      cb();
    });
  }
}

function _openBox(box) {
  imap.openBox(box || 'INBOX', false, cb);
}

function _search(results, type) {
  // TODO FATAL ERROR: JS Allocation failed - process out of memory
  if (results) {
//    console.dir(imap._state.box.permFlags);
    mailObject.messages = results.messages;
    // node-imap "A few days time period does not support queries"
    if (type == 'ALL') {
      imap.search([type, ['SINCE', moment().subtract('weeks', inboxPage)]], cb);
    } else {
      // Open the custom  box time，type Will ALL
      imap.search([type || 'ALL'], cb);
    }
  }
}

function _fetch(results, req, res) {
  var msgChunk = '';
  mailObject.msgs = [];

  if (!results.length) {
    emitter.emit('messages', res);
    return;
  }

  var msgLength = results.length,
    fetch = imap.fetch(results, {
      request: {
        body: 'full',
        headers: false
        // headers: ['from', 'to', 'subject', 'date']
      }
    });

  // req.session Too large, page response speed is significantly slower, estimated to be frequent calls to JSON.stringify(session) gets worse due to the cludge

  console.log('total:', msgLength);

  fetch.on('message', function(msg) {
    msg.on('data', function(chunk) {
      msgChunk += chunk;
      cache.set(msg.seqno, msgChunk);
    });
    msg.on('end', function() {
      if (msgChunk) {
        var mp = new MailParser();
        mp.setMaxListeners(100);
        mp.on('end', function(mail) {

          var data = {
            'msg': msg,
            'mail': mail
          };
          mailObject.msgs.push(data);

          // Persistence to a local database
          (function(data) {
            var id = msg.uid;
            mailUtil.getMailById(id, function(mail) {
              if (!mail) {
                mailUtil.saveMail({id: id, page: inboxPage, data: data, username: req.session.user.name});
//              } else if (mail.page != inboxPage) {
//                mailUtil.updateMail({id: id, page: inboxPage});
              }
            });
          })(data);

          // for (var i = 0; i < mail.attachments && mail.attachments.length; i++) {
          //   console.log(mail.attachments[i].fileName);
          // }
          if (msgLength == mailObject.msgs.length) {
            emitter.emit('messages', res);
          }
        });

        // send the email source to the parser
        mp.end(cache.get(msg.seqno));
        msgChunk = '';
      }
    });
  });
}
