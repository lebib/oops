var fs = require('fs');
var express = require('express');
var oops = require('./lib/oops-server');
var app = express();
var path = require('path');
var util = require('util');
var _ = require('underscore');

// Config
var configFile = 'config/config.json';
var config;
if (!fs.existsSync(configFile)) {
	console.error('Config file ' + configFile + ' not found. Please create it from config.js.distfile');
	process.exit(1);
} else {
	try {
		config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
	} catch (e) {
		console.error('Malformed config file: ' + e.message);
		process.exit(1);
	}
}

// Store sockets
var sockets = {};

// Init oops
oops.init(config, function() {
	initExpress();
});
// Init express

function initExpress() {
	app.configure(function() {
		app.set('views', 'views');
		app.use(express.favicon('public/img/favicon.ico'));
		app.use(express.bodyParser({
			uploadDir: __dirname + path.sep + config.tmpdir
		}));
		app.use(express.methodOverride());
		app.use(express.cookieParser(config.secret));
		app.use(express.static(config.staticdir));
		app.use(express.errorHandler({
			dumpExceptions: true,
			showStack: true
		}));
		app.use(express.session());
		app.use(app.router);
	});

	app.get('/', function(req, res) {
		res.sendfile(__dirname + '/public/index.html');
	});

	app.get('/checkPlace', function(req, res) {
		oops.checkPlace(req.params.lat, req.params.lon);
	});

	// Start server
	var server = app.listen(config.server.port);
	var io = require('socket.io')
		.listen(server);
	io.sockets.on('connection', function(socket) {
		socket.emit('connected', socket.id);
		sockets[socket.id] = socket;
		console.log('A socket connected: ' + socket.id);
		socket.on('disconnect', function() {
			delete sockets[socket.id];
		});
	});
	console.log('Server ready');
}