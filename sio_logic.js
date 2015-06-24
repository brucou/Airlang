/**
 * Created by bcouriol on 15/09/14.
 */
var SIO = {},
// LOG = require('./public/js/lib/debug'),
logger = require('./logger')('sio_logic'),
DB = require('./db_logic'),
Util = require('util'),
U = require('./public/js/lib/utils'), // load the client side utils
RSVP = require('rsvp'),
io,
TSR = require('./TSRModel'),
READER = require('./Reader');
const RPC_NAMESPACE = '/rpc';
const STATE_NAMESPACE = '/state';

var mapListeners = {
   channels       : [RPC_NAMESPACE, STATE_NAMESPACE],
   topic_handlers : [
      {channel : RPC_NAMESPACE, topic : 'highlight_important_words', handler : sio_onHighlight_important_words},
      {channel : RPC_NAMESPACE, topic : 'get_translation_info', handler : sio_onGet_translation_info},
      {channel : RPC_NAMESPACE, topic : 'set_TSR_word_weights', handler : TSR.set_word_weights},
      {channel : RPC_NAMESPACE, topic : 'get_word_to_memorize', handler : TSR.get_word_to_memorize},
      {channel : RPC_NAMESPACE, topic : 'update_word_weight_post_tsr_exo', handler : TSR.update_word_weight_post_exo},
      {channel : RPC_NAMESPACE, topic : 'set_word_user_translation', handler : READER.set_word_user_translation},
      {channel : RPC_NAMESPACE, topic : 'add_note', handler : READER.add_note},
      {channel : STATE_NAMESPACE, topic : 'REST_operation', handler : sio_on_REST}
   ]};

// kept there for now
// TODO : create a query object or file? with an init module for sio which gets the query from the query module
var queryIsOneWordImportant = "select to_tsvector('cs', '%s') @@ to_tsquery('cs', '%s') as highlit_text";

// Main query functions
function sio_onHighlight_important_words ( msg, callback ) {
   logger.info( 'highlight_important_words message received', msg);

   var freq_word_list = DB.get_important_words();
   if (!freq_word_list || freq_word_list.length === 0) {
      logger.error( 'list of important word not set');
      callback('list of important word not set', null);
      return;
   }

   var promise = DB.pg_exec_query('queryHighlightImportantWords', [msg, freq_word_list]);
   // Note : escaping of query is done by using client.query API
   promise.then(
      DB.pg_exec_query_success(callback, function send_back ( result ) {return result.rows[0].highlit_text;}),
      DB.pg_exec_query_failure(callback)
   );
}

function sio_onGet_translation_info ( msg, callback ) {
   logger.info( 'get_translation_info message received: ', msg);
   // $1 : dictionary (here cspell)
   // $2 : the word to be lemmatize
   // The right left -1 -1 is dedicated to removing the begin and end parenthesis
   var promise = DB.pg_exec_query('queryGetTranslationInfo', ['cspell', msg]);
   promise.then(
      DB.pg_exec_query_success(callback, function send_back ( result ) {return result.rows;}),
      DB.pg_exec_query_failure(callback)
   );
}

// State query
function sio_on_REST ( qry_param, callback ) {
   // qry_param  is an object of the form :{action: *, entity : *, criteria : *, values: *, update: *}
   // where action in [select|update|delete|create|insert if not exists] i.e the typical CRUD actions
   //       entity represents information to subselecting information from returned query objects
   logger.event( "received REST object", Util.inspect(qry_param));

   // This should identify in particular:
   // - which database system to use (postgres, MongoDB)
   // - how to query that database for objects
   DB.get_db_adapter(qry_param.entity).exec_query(qry_param)
      .then(callback.bind(this, null), callback);
}

// Initialization functions
SIO.initialize_socket_cnx = function initialize_socket_cnx ( server ) {
   io = require('socket.io')(server);
   logger.info( "socket initialized");
   return io;
};

SIO.init_listeners = function init_listeners () {
   if ('undefined' === typeof io) {
      throw 'io (socket connection) has not been initialized yet';
   }

   io.on(
      'connect', function ( socket ) {
         console.log('Client connected to global namespace');
      });

   mapListeners.channels.forEach(function ( channel ) {
      io.of(channel).on(
         'connect', function ( socket ) {
            logger.info( 'attaching socket handlers for topics on channel ', channel);
            mapListeners.topic_handlers.forEach(function ( topic_handler ) {
               if (topic_handler.channel === channel) {
                  socket.on(topic_handler.topic, topic_handler.handler);
               }
            });
         })
   });

   io.on(
      'disconnect', function ( socket ) {
         LOG.entry('disconnect');
         console.log('Client disconnected');
         DB.close_connection();
         LOG.exit('disconnect');
      });

};

SIO.set_frequent_word_list = function set_frequent_word_list ( listImportantWords ) {
   qryImportantWords = listImportantWords;
};

// Export
// added to the SIO module for testing purpose
module.exports = SIO;
