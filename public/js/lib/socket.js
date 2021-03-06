/**
 * Created by bcouriol on 3/11/14.
 */

define(['socketio', 'utils'], function ( IO, UT ) {
   var SOCK = {},
       rpc_socket,
       RPC_NAMESPACE = '/rpc';
   SOCK.init = function init () {
      rpc_socket = IO.connect(RPC_NAMESPACE);
      logWrite(DBG.TAG.INFO, 'rpc_socket', 'connected');
     console.log("rpc socket", rpc_socket);
     // VERY IMPORTANT FOR NOT SWALLOWING ERROR MESSAGES IN SOCKET:IO
     // IT HAPPENED WHEN THERE WAS AN ERROR IN THE CALLBACK PASSED TO SOCKET.IO!! VERY HARD TO FIND
     rpc_socket.onerror = function socket_onError() {
       //here i change options
       console.log("ERROR", arguments);
       throw "SOCKET IO ERROR"
     }
   };

   SOCK.emit = function ( /*arguments*/ ) {
      rpc_socket.emit.apply(rpc_socket, arguments);
   };

   SOCK.RSVP_emit = function ( topic, message ) {
      return new RSVP.Promise(function ( resolve, reject ) {
         logWrite(DBG.TAG.INFO, 'socket: emitting topic', topic);
         rpc_socket.emit(topic, message, function ( err, result ) {
            if (err) {
               reject(err)
            }
            else {
               resolve(result);
            }
         });
      });
   };

   return SOCK;
});
