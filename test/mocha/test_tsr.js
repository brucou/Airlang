/**
 * Created by bcouriol on 25/11/14.
 */
var chai = require("chai");
chai.config.includeStack = true;
chai.config.showDiff = true;
var assert = chai.assert;

const prefix_src_dir = '../../';
//var assert = require("assert");
var Util = require('util'),
    LOG = require(prefix_src_dir + './public/js/lib/debug'),
    SIO = require(prefix_src_dir + './sio_logic'),
    DB = require(prefix_src_dir + './db_logic'),
    RSVP = require('rsvp'),
    U = require(prefix_src_dir + './public/js/lib/utils'), // load the client side utils
    TSR = require(prefix_src_dir + './TSRModel');

describe('TSR', function () {
   var appState = {user_id : 1};

   before(function () {
      var promise = DB.initialize_database();
      return promise;
   });

   it('set weights new word', function test_set_weight ( done ) {
      // Example obj :: {user_id : self.stateMap.user_id, word : note.word}
      //DB.initialize_database();
      //U.assert_properties({user: 1}, {user: 'Numbe'});
      TSR.set_word_weights(
         {user_id : 1, word : 'psali'},
         function ( err, result ) {
            if (err) {
               LOG.write(LOG.TAG.ERROR, err);
               done(Error(err));
            }
            else {
               LOG.write(LOG.TAG.DEBUG, result);
               assert.equal(1, 1);
               done();
            }
         })
   });

   it('get_word_to_memorize', function ( done ) {
      TSR.get_word_to_memorize(appState, function ( err, result ) {
         if (err) {
            done(Error(err));
         }
         else {
            LOG.write(LOG.TAG.DEBUG, result);
            assert.equal(1, 1);
            done();
         }
      });
   });
});
