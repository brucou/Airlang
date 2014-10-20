/**
 * Created by bcouriol on 16/06/14.
 */

/*
 NOTE : to configure postgres sql database to include czech text search, executing the following script is necessary
 as well as copying the czech files in the corresponding directory. cf. http://postgres.cz/wiki/Instalace_PostgreSQL
 CREATE TEXT SEARCH DICTIONARY cspell
 (template=ispell, dictfile = czech, afffile=czech, stopwords=czech);
 CREATE TEXT SEARCH CONFIGURATION cs (copy=english);
 ALTER TEXT SEARCH CONFIGURATION cs
 ALTER MAPPING FOR word, asciiword WITH cspell, simple;

 Then 'cs' is the name for full text search
 */

// TODO: check if db connections are pooled, otherwise pool them : performance should be better

var http, express, app, io, server, _; // server connection variables
var pgClient; //postgresSQL connection variable


_ = require('underscore');
var Util = require('util');
//var Promise = require('es6-promise').Promise;
var LOG = require('./debug');
var U = require('./utils');
var SIO = require('./sio_logic');
var DB = require('./db_logic');

LOG.trace(SIO, 'SIO');
LOG.trace(DB, 'DB');

const PREFIX_DIR_SERVER = '../server';
const PREFIX_DIR_CLIENT = '.';

function initialize_server () {
   express = require('express');
   app = express();

   console.log("port:", process.env.PORT);

   app.set('port', (process.env.PORT || 3000));
   // Set the view engine
   app.set('view engine', 'jade');
   // Where to find the view files
   app.set('views', __dirname + '/views'); //__dirname : directory in which the currently executing script resides

   app.use(express.static(__dirname + "/public/")); //we point to the home directory of the project to get any files there

   // A route for the home page - will render a view
   app.get(
      '/', function (req, res) {// won't execute as the static file loader of express will use index.html instead
         LOG.write(LOG.TAG.INFO, "entered routing of /");
         res.render('hello');
      });

   var srver = require('http').Server(app);

   return srver;
}

function initialize_string_lib () {
   LOG.entry('initialize_string_lib');
   // Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
   _.str = require('underscore.string');
   // Mix in non-conflict functions to Underscore namespace if you want
   _.mixin(_.str.exports());
   // All functions, include conflict, will be available through _.str object
   _.str.include('Underscore.string', 'string'); // => true
   LOG.exit('initialize_string_lib');
}

initialize_string_lib();
server = initialize_server();
LOG.write(LOG.TAG.INFO, "done : server initialized");

io = SIO.initialize_socket_cnx(server);
SIO.init_listeners ();
LOG.write(LOG.TAG.INFO, "done : sockets listenener initialized");

server.listen(
   app.get('port'), function () {
      console.log('done : app started');
   });

DB.initialize_database();
LOG.write(LOG.TAG.INFO, "done : sent request for database initialization");

// io.set('log level', 2); for socket.io before 1.0

