/**
 * Created by bcouriol on 15/09/14.
 */
var SIO = {};
var LOG = require('./debug');
var DB = require('./db_logic');
var Util = require('util');
var io;
const RPC_NAMESPACE = '/rpc';
const STATE_NAMESPACE = '/state';

// kept there for now
// TODO : create a query object or file? with an init module for sio which gets the query from the query module
var queryIsOneWordImportant = "select to_tsvector('cs', '%s') @@ to_tsquery('cs', '%s') as highlit_text";

// Main query functions
SIO.sio_onHighlight_important_words = function sio_onHighlight_important_words ( msg, callback ) {
   LOG.write(LOG.TAG.INFO, 'highlight_important_words message received', msg);

   var freq_word_list = DB.get_important_words();
   if (freq_word_list.length === 0) {
      LOG.write(LOG.TAG.ERROR, 'list of important word not set');
      callback('list of important word not set', null);
      return;
   }

   var promise = DB.pg_exec_query('queryHighlightImportantWords', [msg, freq_word_list]);
   // Note : escaping of query is done by using client.query API
   promise.then(
      SIO.pg_exec_query_success(callback, function send_back ( result ) {return result.rows[0].highlit_text;}),
      SIO.pg_exec_query_failure(callback)
   );
};

SIO.sio_onGet_translation_info = function sio_onGet_translation_info ( msg, callback ) {
   LOG.write(LOG.TAG.INFO, 'get_translation_info message received: ', msg);
   // $1 : dictionary (here cspell)
   // $2 : the word to be lemmatize
   // The right left -1 -1 is dedicated to removing the begin and end parenthesis
   var promise = DB.pg_exec_query('queryGetTranslationInfo', ['cspell', msg]);
   promise.then(
      SIO.pg_exec_query_success(callback, function send_back ( result ) {return result.rows;}),
      SIO.pg_exec_query_failure(callback)
   );
};

// State query
SIO.sio_on_REST = function sio_on_REST ( qry_param, callback ) {
   // qry_param  is an object of the form :{action: action, entity : entity, criteria : criteria}
   // where action in [select|update|delete|create] i.e the typical CRUD actions
   //       entity represents information to subselecting information from returned query objects
   //       criteria represents the criteria

   // This should identify in particular:
   // - which database system to use (postgres, MongoDB)
   // - how to query that database for objects
   var dbAdapter = DB.get_db_adapter('sio_on_REST');
   // change of name just to make it clear what is in msg

   // a second argument is possible to transform the output of the query before emitting on the socket
   // cf. sio_onGet_translation_info
   dbAdapter.exec_query(qry_param)
      .then(function success (result) {callback(null,result);}, function failure(err) {callback(err.toString(), null);});

   // Ex: MongoDB code
   //db.collection.find(criteria)

};

// Helper functions
SIO.pg_exec_query_success = function pg_exec_query_success ( callback, extractDataFromResult ) {
   return function ( result ) {
      if (result && result.rows) {
         var returnedResult = extractDataFromResult(result);
         LOG.write(LOG.TAG.DEBUG, "callback results", returnedResult);
         callback(null, returnedResult);
      }
      else {
         callback(Error('query executed but no rows found?'), null);
      }
   };
};

SIO.pg_exec_query_failure = function pg_exec_query_failure ( callback ) {
   return function ( errError ) {
      callback(errError, null);
   };
};

// Initialization functions
SIO.initialize_socket_cnx = function initialize_socket_cnx ( server ) {
   io = require('socket.io')(server);
   LOG.write(LOG.TAG.INFO, "socket initialized");
   return io;
};

SIO.init_listeners = function init_listeners () {
   if ('undefined' === typeof io) {
      throw 'io (socket connection) has not been initialized yet';
   }

   io.on(
      'connect', function ( socket ) {
         console.log('Client connected no namespace');
      });

   io.of(RPC_NAMESPACE).on(
      'connect', function ( socket ) {
         LOG.entry('connect on namespace ' + RPC_NAMESPACE);

         socket.on('highlight_important_words', SIO.sio_onHighlight_important_words);

         socket.on('get_translation_info', SIO.sio_onGet_translation_info);

         LOG.exit('connect on namespace ' + RPC_NAMESPACE);
      });

   io.of(STATE_NAMESPACE).on(
      'connect', function ( socket ) {
         LOG.entry('connect on namespace ' + STATE_NAMESPACE);

         socket.on('REST_operation', SIO.sio_on_REST);

         LOG.exit('connect on namespace ' + STATE_NAMESPACE);
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
module.exports = SIO;
