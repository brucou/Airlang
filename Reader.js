/**
 * Created by bcouriol on 13/12/14.
 */
var LOG = require('./public/js/lib/debug'),
DB = require('./db_logic'),
Util = require('util'),
U = require('./public/js/lib/utils'), // load the client side utils
RSVP = require('rsvp');

function set_word_user_translation ( obj, callback ) {
   var translation_word = obj.translation_word,
       first_language = obj.first_language,
       target_language = obj.target_language,
       sample_sentence_first_lg = obj.sample_sentence_first_lg,
       sample_sentence_target_lg = obj.sample_sentence_target_lg;

   LOG.write(LOG.TAG.INFO, "received object", Util.inspect(obj));

}

module.exports = {
   set_word_user_translation : set_word_user_translation
};
