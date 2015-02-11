exports.index = function(req, res, next) {
  if (req.session.user) {
    res.locals.tag = '';
    res.render('mail/list.html');
  } else {
    res.redirect('/login');
  }
};
