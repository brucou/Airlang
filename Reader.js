/**
 * Created by bcouriol on 13/12/14.
 */
var LOG = require('./public/js/lib/debug'),
DB = require('./db_logic'),
Util = require('util'),
U = require('./public/js/lib/utils'), // load the client side utils
RSVP = require('rsvp');

function set_word_user_translation ( obj, callback ) {
   var word = obj.word,
       lemma = obj.lemma_target_lg,
       lemma_translation = obj.translation_word,
       first_language = obj.first_language,
       target_language = obj.target_language,
       sample_sentence_first_lg = obj.sample_sentence_first_lg,
       sample_sentence_target_lg = obj.sample_sentence_target_lg,
       user_id = obj.user_id,
       morph_info = null;

   // do a select on user_id, word, lemma, lemma_translation, morph_info
   // if nothing return, then insert else just do callback OK but with warning message : already exists
   // else insert all obj in the database
   // NOTE: This is an upsert function, it could be written to be reused
   // entity : the table, action : insert ifnotexists, criteria : key : {key fields}, upsert: objRow = {fields: value}
   LOG.write(LOG.TAG.INFO, "received object", Util.inspect(obj));

}

module.exports = {
   set_word_user_translation : set_word_user_translation
};
