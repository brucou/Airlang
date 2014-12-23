/**
 * Created by bcouriol on 14/10/14.
 */
var chai = require("chai");
chai.config.includeStack = true;
chai.config.showDiff = true;
var assert = chai.assert;

const prefix_src_dir = '../../';
//var assert = require("assert");
var Util = require('util');
var LOG = require(prefix_src_dir + './public/js/lib/debug');
var SIO = require(prefix_src_dir + './sio_logic');
var DB = require(prefix_src_dir + './db_logic');
var RSVP = require('rsvp');

describe('database queries', function () {
   before(function () {
      // disable logs as it interfers with nice presentation of mocha reporters
      LOG.setConfig(LOG.TAG.TRACE, false, {by_default : false});
      LOG.setConfig(LOG.TAG.INFO, false, {by_default : false});
      LOG.setConfig(LOG.TAG.ERROR, false, {by_default : false});
      LOG.setConfig(LOG.TAG.WARNING, true, {by_default : false}); //
      LOG.setConfig(LOG.TAG.DEBUG, false, {by_default : false}); //

      var promise = DB.initialize_database();

      DB.register_db_adapter('TEST', {database : DB.PG, mapTable : {
         Test_table : 'pg_test_table'
      }});

      return promise;
   });

   describe('Query constructor', function () {
      it('select - simple', function () {
         var mapTable = {
            TSR_word_weight      : 'pg_tsr_word_weight',
            TSR_word_weight_cfg  : 'pg_tsr_word_weight_cfg',
            TSR_word_weight_hist : 'pg_tsr_word_weight_hist'
         };
         var result = DB.qry_make_sql_query({action     : 'select',
                                               entity   : 'TSR_word_weight',
                                               criteria : {
                                                  user_id : 1,
                                                  word    : "mot"
                                               }
                                            }, 1, mapTable);
         var expected = 'select * from TSR_word_weight WHERE user_id = $1 AND word = $2';
         assert.equal(result.qry_string, expected);
         assert.deepEqual(result.aArgs, [1, "mot"]);
      });

      it('select - count', function () {
         var mapTable = {
            TSR_word_weight      : 'pg_tsr_word_weight',
            TSR_word_weight_cfg  : 'pg_tsr_word_weight_cfg',
            TSR_word_weight_hist : 'pg_tsr_word_weight_hist'
         };
         var result = DB.qry_make_sql_query({action     : 'count',
                                               entity   : 'TSR_word_weight',
                                               criteria : {
                                                  user_id : 1,
                                                  word    : "mot"
                                               }
                                            }, 1, mapTable);
         var expected = 'select count(*) from TSR_word_weight WHERE user_id = $1 AND word = $2';
         assert.equal(result.qry_string, expected);
         assert.deepEqual(result.aArgs, [1, "mot"]);
      });

      it('insert - simple', function () {
         var mapTable = {
            TSR_word_weight      : 'pg_tsr_word_weight',
            TSR_word_weight_cfg  : 'pg_tsr_word_weight_cfg',
            TSR_word_weight_hist : 'pg_tsr_word_weight_hist'
         };
         var result = DB.qry_make_sql_query({action   : 'insert',
                                               entity : 'TSR_word_weight',
                                               values : {
                                                  user_id : 1,
                                                  word    : "mot"
                                               }
                                            }, 1, mapTable);
         var expected = 'INSERT INTO TSR_word_weight ( user_id, word ) VALUES ( $1, $2 )';
         assert.equal(result.qry_string, expected);
         assert.deepEqual(result.aArgs, [1, "mot"]);
      });

      it('insert - select', function () {
         var mapTable = {
            TSR_word_weight      : 'pg_tsr_word_weight',
            TSR_word_weight_cfg  : 'pg_tsr_word_weight_cfg',
            TSR_word_weight_hist : 'pg_tsr_word_weight_hist'
         };
         var result = DB.qry_make_sql_query({action     : 'insert',
                                               entity   : 'TSR_word_weight',
                                               criteria : {
                                                  action   : 'select',
                                                  entity   : 'TSR_word_weight_cfg',
                                                  criteria : {
                                                     user_id : 1,
                                                     word    : "mot"
                                                  }}
                                            }, 1, mapTable);
         var expected = 'INSERT INTO TSR_word_weight ' +
                        '( select * from TSR_word_weight_cfg WHERE user_id = $1 AND word = $2 )';
         assert.equal(result.qry_string, expected);
         assert.deepEqual(result.aArgs, [1, "mot"]);
      });

      it('udpate', function () {
         var mapTable = {
            TSR_word_weight      : 'pg_tsr_word_weight',
            TSR_word_weight_cfg  : 'pg_tsr_word_weight_cfg',
            TSR_word_weight_hist : 'pg_tsr_word_weight_hist'
         };
         var result = DB.qry_make_sql_query({action     : 'update',
                                               entity   : 'TSR_word_weight',
                                               criteria : {
                                                  user_id : 1,
                                                  word    : "mot"
                                               },
                                               update   : {
                                                  field1 : 256,
                                                  field2 : "nn"
                                               }
                                            }, 1, mapTable);
         var expected = 'UPDATE  TSR_word_weight SET ( field1, field2 ) = ( $1, $2 ) WHERE user_id = $3 AND word = $4';
         assert.equal(result.qry_string, expected);
         assert.deepEqual(result.aArgs, [256, "nn", 1, "mot"]);
      });

      it('insert if not exists', function () {
         mapTable = {
            TSR_word_weight      : 'pg_tsr_word_weight',
            TSR_word_weight_cfg  : 'pg_tsr_word_weight_cfg',
            TSR_word_weight_hist : 'pg_tsr_word_weight_hist'
         };
         var result = DB.qry_make_sql_query({action     : 'insert if not exists',
                                               entity   : 'TSR_word_weight',
                                               criteria : {
                                                  user_id : 1,
                                                  word    : "mot"
                                               },
                                               values   : {
                                                  user_id : 1,
                                                  word    : "mot",
                                                  lemma   : "m"
                                               }
                                            }, 1, mapTable);
         var expected = 'select * from TSR_word_weight WHERE user_id = $1 AND word = $2;\n' +
                        'INSERT INTO TSR_word_weight ( user_id, word, lemma ) VALUES ( $1, $2, $3 )';
         assert.equal(result.qry_string, expected);
         assert.deepEqual(result.aArgs, [1, "mot", 1, "mot", "m"]);
      });

   });

   describe('Query exec', function () {
      it('select - empty result', function ( done ) {
         var mapTable = {
            TSR_word_weight      : 'pg_tsr_word_weight',
            TSR_word_weight_cfg  : 'pg_tsr_word_weight_cfg',
            TSR_word_weight_hist : 'pg_tsr_word_weight_hist'
         };
         var config = {mapTable : mapTable};
         var pgClient = DB.get_db_client();
         var result = DB.qry_make_sql_query({action     : 'select',
                                               entity   : 'TSR_word_weight',
                                               criteria : {
                                                  user_id : 1,
                                                  word    : "7tiufvg56ruiulvk"
                                               }
                                            }, 1, config);

         DB.pg_single_qry_exec_fn(pgClient, {
            qry_string : result.qry_string,
            aArgs      : result.aArgs})
            .then(function success ( result_rows ) {
                     var expected = 'select * from TSR_word_weight WHERE user_id = $1 AND word = $2';
                     assert.equal(result_rows.length, 0);
                     done();
                  }, done);
      });

      it('insert if not exists', function ( done ) {
         var test_db_adapter = DB.get_db_adapter('TEST');
         test_db_adapter.exec_query({action     : 'insert if not exists', entity : 'Test_table',
                                       criteria : {
                                          first_name : 'bruno',
                                          last_name  : 'couriol'
                                       },
                                       values   : {
                                          user_id    : +1,
                                          first_name : 'bruno',
                                          last_name  : 'couriol',
                                          address    : 'Italska 18'
                                       }})
            .then(function success ( result_rows ) {
                     test_db_adapter.exec_query({action     : 'insert if not exists', entity : 'Test_table',
                                                   criteria : {
                                                      first_name : 'bruno',
                                                      last_name  : 'couriol'
                                                   },
                                                   values   : {
                                                      user_id    : +1,
                                                      first_name : 'bruno',
                                                      last_name  : 'couriol',
                                                      address    : 'Italska 18'
                                                   }})
                        .then(function success ( result_rows ) {
                                 // TODO get back a code which indicates whether it inserted or not
                                 // done has to be called before doing any mocha testing
                                 done();
                                 assert.equal(result_rows.length, 0);
                              }, done);
                  }, done);
      });

   });

   describe('Translation', function () {
      it('Word : projekt', function ( done ) {
         var expected = [
            { translation_lemma      : 'projekt',
               translation_sense     : '',
               lemma_gram_info       : 'n',
               lemma                 : 'project',
               sense                 : '(plan, scheme)',
               translation_gram_info : 'm',
               example_sentence_from : 'I have a few projects that I am working on in the office.',
               example_sentence_to   : 'Mám v kanceláři rozpracovaných pár projektů.',
               freq_cat              : 'A ' },
            { translation_lemma      : 'projekt',
               translation_sense     : '',
               lemma_gram_info       : 'n',
               lemma                 : 'scheme',
               sense                 : '(plan: outrageous)',
               translation_gram_info : 'm',
               example_sentence_from : 'He is always thinking of a new scheme to become rich.',
               example_sentence_to   : 'Architekt nakreslil návrh, než začala stavba.',
               freq_cat              : 'A ' },
            { translation_lemma      : 'projekt',
               translation_sense     : '',
               lemma_gram_info       : 'n',
               lemma                 : 'scheme',
               sense                 : '(plan: outrageous)',
               translation_gram_info : 'm',
               example_sentence_from : 'He is always thinking of a new scheme to become rich.',
               example_sentence_to   : 'Pořád vymýšlí plán, jak zbohatnout.',
               freq_cat              : 'A ' },
            { translation_lemma      : 'projekt',
               translation_sense     : '',
               lemma_gram_info       : 'n',
               lemma                 : 'operation',
               sense                 : '(mission)',
               translation_gram_info : 'm',
               example_sentence_from : null,
               example_sentence_to   : null,
               freq_cat              : 'A ' }
         ];
         var promise = DB.pg_exec_query('queryGetTranslationInfo', ['cspell', 'projekt']);
         //return assert.becomes(promise, "foo", "optional message");
         return promise.then(function pg_exec_query_success ( result ) {
                                if (result && result.rows) {
                                   //console.log(result.rows);
                                   assert.equal(result.rows.length, 4, 'projekt has 4 translations rows');
                                   assert.deepEqual(result.rows, expected,
                                                    'expected : scheme (2x), operation (1x), project (1x)');
                                   done();
                                }
                                else {
                                   done(Error('query executed but no rows found?'));
                                }
                             },
                             function pg_exec_query_failure ( errError ) {
                                done(errError);
                             });
      });
      it('Word : projekt', function ( done ) {
         var promise = DB.pg_exec_query('queryGetTranslationInfo', ['cspell', 'projekt']);
         //return assert.becomes(promise, "foo", "optional message");
         return promise.then(function pg_exec_query_success ( result ) {
                                if (result && result.rows) {
                                   assert.equal(result.rows.length, 4, 'projekt has 4 translations rows');
                                   done();
                                }
                                else {
                                   done(Error('query executed but no rows found?'));
                                }
                             },
                             function pg_exec_query_failure ( errError ) {
                                done(errError);
                             });
      });

   });
})
;
