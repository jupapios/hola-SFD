
/*
 * GET home page.
 */

exports.index = function(req, res){
	// if login
		res.render('index', { title: 'getUserMedia', onlineFriends: ["amigo 1", "amigo 2", "amigo 3"]});
	// else
  		//res.redirect('/login');
};

exports.login = function(req, res){
  res.render('login', { title: 'getUserMedia' });
};

exports.register = function(req, res){
  res.render('register', { title: 'getUserMedia' });
};

exports.chat = function(req, res){
  res.render('chat', { title: 'getUserMedia' });
};