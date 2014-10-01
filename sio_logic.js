/**
 * Created by bcouriol on 15/09/14.
 */
var SIO= {};
var LOG = require('./debug');
var DB = require('./db_logic');
var Util = require('util');
var io;
const RPC_NAMESPACE = '/rpc';

// kept there for now
// TODO : create a query object or file? with an init module for sio which gets the query from the query module
var queryIsOneWordImportant = "select to_tsvector('cs', '%s') @@ to_tsquery('cs', '%s') as highlit_text";

SIO.process_qryHighlightImportantWords = function process_qryHighlightImportantWords (err, result, callback) {
   //TODO: change to err, result the callback
   //LOG.entry('process_qryHighlightImportantWords');
   if (err) {
      LOG.write(LOG.TAG.ERROR, 'error running qryHighlightImportantWords query', err);
      callback(err, result);
      //LOG.exit('process_qryHighlightImportantWords');
      return;
   }
   //console.log('displaying result', result.rows[0].highlit_text);
   if (result && result.rows) {
      var highlit_text = result.rows[0].highlit_text;
      LOG.write(LOG.TAG.DEBUG, "callback results", highlit_text);
      //LOG.exit('process_qryHighlightImportantWords');
      callback(err, highlit_text);
      // just in case, but because err is catched, should not be necessary
   }
};

SIO.sio_onHighlight_important_words = function sio_onHighlight_important_words (msg, callback) {
   LOG.write(LOG.TAG.INFO, 'highlight_important_words message received', msg);
   //cf. https://github.com/brianc/node-postgres/wiki/Client#method-query-parameterized

   var pgClient = DB.get_db_client(); // do something in case there is no client
   if (!pgClient) {
      LOG.write(LOG.TAG.ERROR, 'no database client connection found');
      callback('no database client connection found', null);
      return;
   }

   var freq_word_list = DB.get_important_words();
   if (freq_word_list.length === 0) {
      LOG.write(LOG.TAG.ERROR, 'list of important word not set');
      callback('list of important word not set', null);
      return;
   }

   // Note : escaping of query is done by using client.query API
   var qryHighlightImportantWords = "select ts_headline('cs', $1, to_tsquery('cs', $2), " +
      "'StartSel=\"<span class = ''highlight''>\", StopSel=\"</span>\", HighlightAll=true') " +
      "as highlit_text"; //important the first %s has no quotes

   pgClient.query(
      qryHighlightImportantWords, [msg, freq_word_list],
      function (err, result) {SIO.process_qryHighlightImportantWords(err, result, callback);});
   LOG.write(LOG.TAG.INFO, 'query sent to database server, waiting for callback');
};

SIO.sio_onGet_translation_info = function sio_onGet_translation_info (msg, callback) {
   console.log('get_translation_info message received: ', msg);
   // $1 : dictionary (here cspell)
   // $2 : the word to be lemmatize
   // The right left -1 -1 is dedicated to removing the begin and end parenthesis
   var queryGetTranslationInfo = "SELECT DISTINCT " +
      " pglemmatranslationcz.translation_lemma, " +
      " pglemmatranslationcz.translation_sense, " +
      " pglemmaen.lemma_gram_info, " +
      " pglemmaen.lemma, " +
      " pglemmaen.sense, " +
      " pglemmatranslationcz.translation_gram_info, " +
      " pgsamplesentenceencz.example_sentence_from, " +
      " pgsamplesentenceencz.example_sentence_to, " +
      " pgwordfrequency_short.freq_cat" +
      " FROM pglemmaen" +
      " INNER JOIN pglemmatranslationcz " +
      " ON (pglemmatranslationcz.lemma_sense_id = pglemmaen.lemma_sense_id) " +
      " LEFT JOIN pgsamplesentenceencz " +
      " ON (pglemmatranslationcz.lemma_sense_id = pgsamplesentenceencz.lemma_sense_id)" +
      " INNER JOIN pgwordfrequency_short" +
      " ON (pglemmatranslationcz.translation_lemma = pgwordfrequency_short.lemma)" +
      " WHERE LOWER(pglemmatranslationcz.translation_lemma) in " +
      "     (select unnest(string_to_array(right(left(ts_lexize($1, $2)::varchar, -1), -1), ',')))";

   var pgClient = DB.get_db_client(); // do something in case there is no client
   if (!pgClient) {
      LOG.write(LOG.TAG.ERROR, 'no database client connection found');
      callback('no database client connection found', null);
      return;
   }

   pgClient.query(
      queryGetTranslationInfo, ['cspell', msg], function (err, result) {
         if (err) {
            LOG.write(LOG.TAG.ERROR, 'error running query', err);
            callback(err, result);
            return;
         }
         if (result && result.rows) {
            LOG.write(LOG.TAG.DEBUG, "callback results", Util.inspect(result.rows));
            callback(null, result.rows);
            // just in case, but because err is catched, should not be necessary
         }
      });

};

SIO.initialize_socket_cnx = function initialize_socket_cnx (server) {
   io = require('socket.io')(server);
   LOG.write(LOG.TAG.INFO, "socket initialized");
   return io;
};

SIO.init_listeners = function init_listeners () {
   if ('undefined' === typeof io) {
      throw 'io (socket connection) has not been initialized yet';
   }

   io.on(
      'connect', function (socket) {
         console.log('Client connected no namespace');
      });

   io.of(RPC_NAMESPACE).on(
      'connect', function (socket) {
         LOG.entry('connect on namespace ' + RPC_NAMESPACE);
         console.log('Client connected');

         socket.on('highlight_important_words', SIO.sio_onHighlight_important_words);

         socket.on('get_translation_info', SIO.sio_onGet_translation_info);
         LOG.exit('connect on namespace ' + RPC_NAMESPACE);
      });

   io.on(
      'disconnect', function (socket) {
         LOG.entry('disconnect');
         console.log('Client disconnected');
         DB.close_connection();
         LOG.exit('disconnect');
      });

};

SIO.set_frequent_word_list = function set_frequent_word_list (listImportantWords) {
   qryImportantWords = listImportantWords;
};

module.exports = SIO;
