/**
 * Created by bcouriol on 3/11/14.
 */
   //TODO : remove the global rpc_socket

define(['socketio', 'utils'], function ( IO, UT ) {
   var SOCK = {},
      rpc_socket,
      RPC_NAMESPACE = '/rpc';

   SOCK.init = function init () {
      rpc_socket = IO.connect(RPC_NAMESPACE);
      logWrite(DBG.TAG.INFO, 'rpc_socket', 'connected');
   };

   SOCK.get_socket = function () {
      return rpc_socket;
   }

   return SOCK;
});
