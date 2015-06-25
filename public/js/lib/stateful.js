/**
 * Created by bcouriol on 3/11/14.
 */

define(['socketio', 'rsvp', 'utils'], function ( IO, RSVP, UT ) {
   var state_socket;
   var STATE_NAMESPACE = '/state';

   // Helper functions
   function cb_stored_stateful_object ( resolve, reject ) {
      return function ( err, result ) {
         // 2d. In case of error, do not throw exception, resolve the promise with an error message
         err ? reject(err) : resolve(result);
      }
   }
   /////////////

   /**
    * Initialize stateful module
    */
   function init () {
      state_socket = IO.connect(STATE_NAMESPACE);
      logWrite(DBG.TAG.INFO, 'state_socket', 'connected');
      // we have to use return in case the connection is asynchronous and returns a promise
      return state_socket;
   }

   /**
    * Returns an entity (any type of object) from a storage house (for instance a database)
    *
    * @param entity {string} the entity to retrieve
    * @param qryParam {object} object with a set of properties which should unequivocally identify the entity to retrieve
    * @returns {promise|object} if the call is asynchronous, returns a promise; otherwise an object is returned
    * For instance:
    * - get_stored_stateful_object ('Collection_Notes', {module: xx, user_id: xx, url: xx})
    *   Retrieve [Note] with Note :: (word, index) from a database on the server
    * Implementation notes:
    * - input validation must occur both on the sending and receiving end of the 'get' request
    *   this means there could be a map between entity and the expected properties for the criteria object
    *   in which name of properties and expected types are specified
    * - do not throw exception, but a mechanism in the return object must be found to identify what went wrong
    */
   function get_stored_stateful_object ( entity, qryParam ) {
      return execute_stateful_query(UT._extend(qryParam, {action : 'select', entity : entity}));
   }

   function update_stored_stateful_object () {
   }

   function insert_stored_stateful_object ( entity, qryParam ) {
      // STATE.insert_stored_stateful_object ('Notes', {values : {module    : 'reader tool',
      //                                                           url : this.stateMap.viewAdapter.url_to_load,
      //                                                           user_id : this.stateMap.user_id, word : note.word,
      //                                                           index : note.index}}
      // insert into NOTES (fields) VALUES (fields : values)
      return execute_stateful_query(entity, UT._extend(qryParam, {action : 'insert', entity : entity}));
   }

   function insert_if_ne_stored_stateful_object ( entity, qryParam ) {
      return execute_stateful_query(UT._extend(qryParam, {action : 'insert if not exists', entity : entity}));
   }

   function execute_stateful_query (qryParam ) {
      // TODO : refactor to use SOCK.RSVP_emit (NEW: socket, same)
      return (!state_socket) ?
             UT.log_error("execute_stateful_query", "socket not initialized?") :
             new RSVP.Promise(function ( resolve, reject ) {
                // 2b. Select channel 'state' and message to send to socket
                state_socket.emit('REST_operation', qryParam,
                                  cb_stored_stateful_object(resolve, reject));
             });
   }

   return {
      get_stored_stateful_object          : get_stored_stateful_object,
      insert_stored_stateful_object       : insert_stored_stateful_object,
      insert_if_ne_stored_stateful_object : insert_if_ne_stored_stateful_object,
      init                                : init
   }
})
;
