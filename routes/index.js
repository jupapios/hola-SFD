
/*
 * GET home page.
 */

exports.index = function(req, res){
	var id=null;
	if(req.query.id) {
		id = req.query.id;
	}
	res.render('index', { title: 'hola', id: req.session.auth.twitter.user.screen_name });
};

exports.login = function(req, res){
  res.render('login', { title: 'hola' });
};

exports.register = function(req, res){
  res.render('register', { title: 'hola' });
};