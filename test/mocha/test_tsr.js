/**
 * Created by bcouriol on 25/11/14.
 */
var chai = require("chai");
chai.config.includeStack = true;
chai.config.showDiff = true;
var assert = chai.assert;

const prefix_src_dir = '../../';
//var assert = require("assert");
var Util = require('util');
var LOG = require(prefix_src_dir + './debug');
var SIO = require(prefix_src_dir + './sio_logic');
var DB = require(prefix_src_dir + './db_logic');
var RSVP = require('rsvp');

describe('TSR', function () {
   before(function () {
      var promise = DB.initialize_database();
      return promise;
   });

   it('set weights new word', function ( done ) {
      // Example obj :: {user_id : self.stateMap.user_id, word : note.word}
      //DB.initialize_database();
      SIO.sio_onSet_TSR_word_weights(
         {user_id : 1, word : 'psali'},
         function ( err, result ) {
            if (err) {
               LOG.write(LOG.TAG.ERROR, err);
               done(Error(err));
            }
            else {
               LOG.write(LOG.TAG.DEBUG, result);
               assert.equal(1,1);
               done();
            }
         })
   });
});
