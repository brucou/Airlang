/**
 * Created by bcouriol on 16/12/14.
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

describe('test uick things', function () {
   before(function () {
      // disable logs as it interfers with nice presentation of mocha reporters
      LOG.setConfig(LOG.TAG.TRACE, false, {by_default : false});
      LOG.setConfig(LOG.TAG.INFO, false, {by_default : false});
      LOG.setConfig(LOG.TAG.ERROR, false, {by_default : false});
      LOG.setConfig(LOG.TAG.WARNING, true, {by_default : false}); //
      LOG.setConfig(LOG.TAG.DEBUG, false, {by_default : false}); //

      var promise = DB.initialize_database();
      return promise;
   });

// TODO
});
