Object.defineProperty(global, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function(){
    return __stack[1].getLineNumber();
  }
});


var express = require('express')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')


var app = express();

console.log("process.env[NODE_TYPE]: ", process.env["NODE_TYPE"]);

var port = process.env["NODE_PORT"];

if (process.env["NODE_TYPE"] === "server") {
  // Get logger handler
  var di = {};
  di.config = require('./config/config.js');
  di.client = require('./utils/db-conn.js');
  di.winston = require('winston');
  di.events = require('events');
  console.log("requiring logger");
  var logger = require('./utils/logger.js').inject(di);
}

//CORS middleware
var allowCrossDomain = function(req, res, next) {
  console.log("allowCrossDomain");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, PUT, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  // res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
}

app.configure(function () {
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(connect.bodyParser({uploadDir:'./uploads'}));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('test'));
  app.use(express.session());
  // app.use(allowCrossDomain);
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.locals.pretty = true;

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.use(require("./lib"));

app.options("*", function (req, res) {
  console.log("options route");
  res.json(true);
})

process.on('uncaughtException', function(err) {
  console.log( "Error: Uncaught Exception, " + err.toString(), {file: __filename, line: __line});
});


// Create && Start http server
console.log("creating http server...");
var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

if (process.env["NODE_TYPE"] === "server") {
  logger.on("socket", function () {
    console.log("**********logger on.socket");
    this.socketIO = loggerSocket;
    // logger.info("after socket ON");
    // console.log("this: ", this);
  });

  // Create socket.io connection
  var io = require('socket.io')
  console.log("creating socket connection");
  var loggerSocket = io.listen(server, {log: false}).of('/logger');


  loggerSocket.on('connection', function(socket){
    console.log("Logger Client Connected");
    socket.join(socket.handshake.sessionID);
    // Emit event to logger
    logger.emit("socket");
  });
}


