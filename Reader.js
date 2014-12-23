/**
 * Created by bcouriol on 13/12/14.
 */
var LOG = require('./public/js/lib/debug'),
DB = require('./db_logic'),
Util = require('util'),
U = require('./public/js/lib/utils'), // load the client side utils
RSVP = require('rsvp');

function add_note ( note_qry_obj, callback ) {
   LOG.write(LOG.TAG.EVENT, "received object", Util.inspect(note_qry_obj));
   /* note_obj ::
    {
    action   : 'insert if not exists',
    entity   : 'Notes',
    criteria : key_exists,
    values   : UT._extend(key_exists, fields_remainder)}
    */
   return DB.get_db_adapter(note_qry_obj.entity)
      .exec_query(note_qry_obj)
      // the bind hack allow to use callback while keeping context and adding a null argument before the result argument
      .then(callback.bind(this, null), callback);
}

function set_word_user_translation ( obj, callback ) {
   LOG.write(LOG.TAG.EVENT, "received object", Util.inspect(obj));
   // 1. look if a row already exists with the same parameters but removing the sample sentences (not part of the key)
   // To do that create the objects that will be used in the query
   // criteria contains the fields of the key to be checked against
   // values object contains all the fields which will be inserted in the table (if not exists)
   var criteria_obj = {
          word              : obj.word,
          lemma             : obj.lemma_target_lg,
          lemma_translation : obj.translation_word,
          first_language    : obj.first_language,
          target_language   : obj.target_language,
          user_id           : obj.user_id,
          morph_info        : '-'
       },
       values_obj = {
          sample_sentence_first_lg  : obj.sample_sentence_first_lg,
          sample_sentence_target_lg : obj.sample_sentence_target_lg};
   U._extend(values_obj, criteria_obj);

   // do a select on user_id, word, lemma, lemma_translation, morph_info
   // if nothing return, then insert else just do callback OK but with warning message : already exists
   // else insert all obj in the database
   // NOTE: This is an upsert function, it could be written to be reused
   // entity : the table, action : insert ifnotexists, criteria : key : {key fields}, upsert: objRow = {fields: value}

   return DB.get_db_adapter('User_Translation')
      .exec_query({action     : 'insert if not exists', entity : 'word_user_translation',
                     criteria : criteria_obj,
                     values   : values_obj})
      .then(function success ( result ) {
               // TODO get back a code which indicates whether it inserted or not
               callback(null, result);
            }, callback);
}

module.exports = {
   add_note                  : add_note,
   set_word_user_translation : set_word_user_translation
};
