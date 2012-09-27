
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


var WebSocketServer = require('websocket').server;
//var http = require('http');
var clients = {};


// create the server
ws = new WebSocketServer({
	httpServer: server
});

function sendCallback(err) {
	if (err) console.error("send() error: " + err);
}

var connId = 0;
var instances = {};
var instances_tmp = {};

ws.on('request', function(request) {
	
		var socket = request.accept(null, request.origin);

		socket.on('message', function(message) {
			var data = JSON.parse(message.utf8Data);

			if(data.type == 'invitation') {
				if(instances[data.user]) {
					var msg = JSON.stringify({type: 'invitation', id: data.id});
					instances[data.user].send(msg);
				} else {
					var msg = JSON.stringify({type: 'error', id: data.id});
					socket.send(msg);
				}

			} else if(data.type == 'join') {
				instances[data.id] = socket;

			} else {
				instances[data.id].send(message.utf8Data);
			}
		});
		
		socket.on('close', function(socket) {
			// close user socket
			console.log((new Date()) + " Peer disconnected.");        
		});
});

server.listen(app.get('port'), function(){});
