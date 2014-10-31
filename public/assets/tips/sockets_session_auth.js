/**
 * Created by bcouriol on 31/10/14.
 */
// from http://stackoverflow.com/questions/14624810/why-socket-io-s-get-is-not-able-to-get-data-from-persistent-session
var express = require('express'),
app = express(),
http = require('http'),
server = http.createServer(app),
users = 0,
MemoryStore = express.session.MemoryStore,
sessionStore = new MemoryStore(),
parseCookie = require('cookie').parse,
utils = require('connect').utils,
io = require('socket.io').listen(server);

app.use( express.bodyParser() );
app.use( express.cookieParser('secret') );
app.use( express.session({secret: 'secret', store:sessionStore}) );

app.get('/', function(req, res) {
   var user = req.session.username ? req.session.username : null;
   if ( !user ) {
      user = 'user_' + users++;
      req.session.username = user;
      req.session.save();
   }
   res.send('<!doctype html> \
        <html> \
        <head><meta charset="utf-8"></head> \
        <body> \
            <center>Welcome ' + user + '</center> \
            <script src="/socket.io/socket.io.js"></script> \
            <script> \
                var socket = io.connect(); \
                socket.emit("message", "Howdy"); \
            </script> \
        </body> \
        </html>');
});

io.configure(function () {
   io.set('authorization', function (request, callback) {
      var cookie = parseCookie(request.headers.cookie);
      if( !cookie && !cookie['connect.sid'] ) {
         return callback(null, false);
      } else {
         sessionStore.get(utils.parseSignedCookie(cookie['connect.sid'], 'secret'), function (err, session) {
            if ( err ) {
               callback(err.message, false);
            } else {
               if ( session && session.username ) {
                  request.user = session.username;
                  callback(null, true);
               } else {
                  callback(null, false);
               }
            }
         });
      }
   });
});

io.sockets.on('connection', function (socket) {
   socket.on('message', function(msg) {
      console.log(msg + 'from '+ socket.handshake.user);
   });
});

server.listen(8000);
