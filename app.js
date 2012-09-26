
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, path = require('path');

var app = express();


app.locals({
	url: {
		home: '/',
		login: '/login',
		register: '/register',
		chat: '/chat'
	}
});

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get(app.locals.url.home, routes.index);

app.post(app.locals.url.login, user.doLogin);
app.post(app.locals.url.register, user.doRegister);

app.get(app.locals.url.login, routes.login);
app.get(app.locals.url.register, routes.register);

app.get(app.locals.url.chat, routes.chat);

//app.get('/login', user.doLogin);

// app.get('/users', user.list);


var server = http.createServer(app);


var WebSocketServer = require('websocket').server;
//var http = require('http');
var clients = {};


// create the server
wsServer = new WebSocketServer({
		httpServer: server
});

function sendCallback(err) {
	if (err) console.error("send() error: " + err);
}

var connId = 0;

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
	
		console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

		var connection = request.accept(null, request.origin);
		console.log(' Connection ' + connection.remoteAddress);

		clients[connId] = connection;
		var messageId = {type: 'id', id: connId};

		connId++;

		connection.send(JSON.stringify(messageId));
		
		// This is the most important callback for us, we'll handle
		// all messages from users here.
		/*connection.on('message', function(message) {
				if (message.type === 'utf8') {
						// process WebSocket message
						console.log((new Date()) + ' Received Message ' + message.utf8Data);
						// broadcast message to all connected clients
						clients.forEach(function (outputConnection) {
								if (outputConnection != connection) {
									console.log('ENVIAR A '+ outputConnection);
									outputConnection.send(message.utf8Data, sendCallback);
								}
						});
				}
		});*/

		connection.on('message', function(message) {
			var data = JSON.parse(message.utf8Data);
			clients[parseInt(data.peer)].send(message.utf8Data);
		});
		
		connection.on('close', function(connection) {
				// close user connection
				console.log((new Date()) + " Peer disconnected.");        
		});
});

server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
