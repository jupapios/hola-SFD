
/**
 * Module dependencies.
 */
var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, path = require('path')
	, users = require('./lib/users')
;

var everyauth = require('everyauth');

everyauth.twitter
	.consumerKey('Bphd66qZxLo5eKwGuYps2g')
	.consumerSecret('nd3Nf4JjLIS5g8DUpIogiVRT5iIUwnEsrkFMIWVBj0')
	.findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData) {
		var promise = this.Promise();
		users.findOrCreateByTwitterData(twitterUserData, promise);
		return promise;
	})
	.redirectPath('/');


var app = express();


app.locals({
	url: {
		home: '/',
		login: '/login',
		register: '/register'
	}
});

function userMiddleware(req, res, next) {
	if (!req.session.auth || !req.session.auth.loggedIn) {
		res.redirect(app.locals.url.login);
	} else {
		next();
	}
}

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({secret: 'alalalal'}));
	app.use(everyauth.middleware());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get(app.locals.url.home, userMiddleware, routes.index);

app.post(app.locals.url.login, user.doLogin);
app.post(app.locals.url.register, user.doRegister);

app.get(app.locals.url.login, routes.login);
app.get(app.locals.url.register, routes.register);


var server = http.createServer(app);

var io = require('socket.io').listen(server);

var instances = {};

io.sockets.on('connection', function (socket) {

	socket.on('invitation', function (data) {
		if(instances[data.user]) {
			instances[data.user].emit('invitation', {id: data.id});
		} else {
			socket.emit('error', {id: data.id});
		}

	});

	socket.on('join', function (data) {
		instances[data.id] = socket;
	});	

	socket.on('offer', function (data) {
		instances[data.id].emit('offer', data);
	});

	socket.on('answer', function (data) {
		instances[data.id].emit('answer', data);
	});

	socket.on('candidate', function (data) {
		instances[data.id].emit('candidate', data);
	});

});

server.listen(app.get('port'), function(){});