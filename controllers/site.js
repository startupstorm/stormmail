exports.index = function(req, res) {
  res.locals.tag = '';
  res.render('index.html');
};
