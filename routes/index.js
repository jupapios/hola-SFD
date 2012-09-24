
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'getUserMedia' });
};

exports.chat = function(req, res){
  res.render('chat', { title: 'getUserMedia' });
};