/**
 * Created by bcouriol on 15/09/14.
 */
reject_global_var=null;
var SIO = {},
   LOG = require('./debug'),
   DB = require('./db_logic'),
   Util = require('util'),
   U = require('./public/js/lib/utils'), // load the client side utils
   RSVP = require('rsvp'),
   io;
const RPC_NAMESPACE = '/rpc';
const STATE_NAMESPACE = '/state';

var mapListeners = {
   channels       : [RPC_NAMESPACE, STATE_NAMESPACE],
   topic_handlers : [
      {channel : RPC_NAMESPACE, topic : 'highlight_important_words', handler : sio_onHighlight_important_words},
      {channel : RPC_NAMESPACE, topic : 'get_translation_info', handler : sio_onGet_translation_info},
      {channel : RPC_NAMESPACE, topic : 'set_TSR_word_weights', handler : sio_onSet_TSR_word_weights},
      {channel : STATE_NAMESPACE, topic : 'REST_operation', handler : sio_on_REST}
   ]};

//Helper function - error handling in promises
function error_handler ( callback ) {
   return function failure ( err ) {
      callback(err.toString(), null);
   }
}

/**
 * This is to bridge promise and node-style callbacks. The promise returns always one argument
 * which is in second position in node-style callback
 * @param callback
 * @returns {call_callback}
 */
function callback_ok ( callback ) {
   return function call_callback ( result ) {
      callback(null,result);
   }
}

// kept there for now
// TODO : create a query object or file? with an init module for sio which gets the query from the query module
var queryIsOneWordImportant = "select to_tsvector('cs', '%s') @@ to_tsquery('cs', '%s') as highlit_text";

// Main query functions
function sio_onHighlight_important_words ( msg, callback ) {
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
}

function sio_onGet_translation_info ( msg, callback ) {
   LOG.write(LOG.TAG.INFO, 'get_translation_info message received: ', msg);
   // $1 : dictionary (here cspell)
   // $2 : the word to be lemmatize
   // The right left -1 -1 is dedicated to removing the begin and end parenthesis
   var promise = DB.pg_exec_query('queryGetTranslationInfo', ['cspell', msg]);
   promise.then(
      SIO.pg_exec_query_success(callback, function send_back ( result ) {return result.rows;}),
      SIO.pg_exec_query_failure(callback)
   );
}

// State query
function sio_on_REST ( qry_param, callback ) {
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
      .then(function success ( result ) {callback(null, result);},
            error_handler(callback));

   // Ex: MongoDB code
   //db.collection.find(criteria)

}

// Memorization module handlers
function sio_onSet_TSR_word_weights ( obj, callback ) {
   // Example obj :: {user_id : self.stateMap.user_id, word : note.word}
   //check inputs
   if (obj.user_id && obj.word) {
      // check that the word is not already being revised
      var dbAdapter = DB.get_db_adapter('TSR');
      dbAdapter.exec_query({action     : 'select', entity : 'TSR_word_weight',
                              criteria : {
                                 user_id : obj.user_id,
                                 word    : obj.word
                              }})
         .then(
         function success ( result ) {
            if (result.length === 0) {
               // the word is not already being revised
               RSVP.all([
                           dbAdapter.exec_query({action     : 'count', entity : 'TSR_word_weight',
                                                   criteria : {
                                                      user_id : obj.user_id,
                                                      word    : obj.word
                                                   }}),
                           dbAdapter.exec_query({action     : 'select', entity : 'TSR_word_weight_cfg',
                                                   criteria : {
                                                      user_id : obj.user_id
                                                   }})]
               ).then(
                  function success ( aResolves ) {
                     // calculate which weight to apply according to the bucket in which the word falls
                     // config has bucket_weight_0, bucket_weight_1, bucket_weight_2
                     // sends an exception if there is no configuration value
                     var word_list_length_a = aResolves[0],
                        row_tsr_config_a = aResolves[1],
                        word_list_length,
                        row_tsr_config;
                     U.assert_type([word_list_length_a], [{word_list_length_a : 'Array'}], {bool_no_exception : false});
                     U.assert_type([row_tsr_config_a], [{row_tsr_config_a : 'Array'}], {bool_no_exception : false});
                     word_list_length = word_list_length_a[0];
                     row_tsr_config = row_tsr_config_a[0];
                     U.assert_properties(row_tsr_config, {mem_bucket_size : 'Number'}, {bool_no_exception : false});

                     var modulo = word_list_length.count / row_tsr_config.mem_bucket_size;
                     modulo = modulo > 2 ? 2 : Math.floor(modulo);
                     return box_weight = row_tsr_config['bucket_weight' + modulo];
                  }//
               ).then(function success ( box_weight ) {
                         return promise = dbAdapter.exec_query(
                            {action     : 'insert', entity : 'TSR_word_weight',
                               criteria : {
                                  user_id                     : obj.user_id,
                                  word                        : obj.word,
                                  BOX_weight                  : box_weight,
                                  last_revision_time          : new Date(),
                                  last_revision_easyness      : undefined,
                                  last_revision_exercise_type : undefined,
                                  last_revision_grade         : undefined
                               }
                            });
                      }//, error_handler(callback)
               ).then(callback_ok (callback), error_handler(callback));
            }
            else {
               // word already there
               LOG.Write(LOG.TAG.WARNING, "Word is already being revised - ignoring");
               callback(null, "Word is already being revised - ignoring");
            }
         }, error_handler(callback));
   }
   else {
      callback('sio_onSet_TSR_word_weights: malformed parameters');
   }
}

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
         console.log('Client connected to global namespace');
      });

   mapListeners.channels.forEach(function ( channel ) {
      io.of(channel).on(
         'connect', function ( socket ) {
            LOG.write(LOG.TAG.INFO, 'attaching socket handlers for topics on channel ', channel);
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
SIO.sio_onSet_TSR_word_weights = sio_onSet_TSR_word_weights;
module.exports = SIO;
