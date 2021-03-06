/**
 * Created by bcouriol on 27/11/14.
 */

var LOG = require('./public/js/lib/debug').getLogger("TSRModel"),
   logger = require('./logger')('TSRModel'),
   DB = require('./db_logic'),
   Util = require('util'),
   U = require('./public/js/lib/utils'), // load the client side utils
   RSVP = require('rsvp');

// Memorization module handlers
/**
 * Inserts a word in the table which follows the TSR weight model iff there is no other line already there
 * We thus ensure that the word is not inserted twice
 * @param obj
 * @param callback
 */
function set_word_weights ( obj, callback ) {
   // TODO: Also test for more than 20 values that the weight inserted is adjusted
   // Example obj :: {user_id : self.stateMap.user_id, word : note.word}
   //check inputs
   if (obj.user_id && obj.word && obj.first_language && obj.target_language) {
      // check that the word is not already being revised
      get_specific_word_weight(obj.user_id, obj.word, obj.first_language, obj.target_language)
         .then(
         function success_qry_word_weight ( result ) {
            if (result.length === 0) {
               // the word is not already being revised
               RSVP.all([get_count_words(obj.user_id, obj.first_language, obj.target_language),
                         get_word_weights_cfg(obj.user_id)])
                  .then(compute_box_weight)
                  .then(insert_word_weight(obj.user_id, obj.word, obj.first_language, obj.target_language))
                  .then(U.callback_ok(callback), callback);
            }
            else {
               // word already there
               LOG.warning( "Word is already being revised - ignoring");
               callback(null, null); // the null value of result may be observed  on the calling side and decided on
            }
         }, callback);
   }
   else {
      callback('set_word_weights: malformed parameters');
   }
}

function compute_box_weight ( aResolves ) {
   // calculate which weight to apply according to the bucket in which the word falls
   // config has bucket_weight_0, bucket_weight_1, bucket_weight_2
   // sends an exception if there is no configuration value
   var word_list_length_a = aResolves[0],
      row_tsr_config_a = aResolves[1],
      word_list_length,
      row_tsr_config;

   U.assert_type([word_list_length_a], [
      {word_list_length_a : 'Array'}
   ], {bool_no_exception : false});

   U.assert_type([row_tsr_config_a], [
      {row_tsr_config_a : 'Array'}
   ], {bool_no_exception : false});

   word_list_length = word_list_length_a[0];
   row_tsr_config = row_tsr_config_a[0];
   U.assert_properties(row_tsr_config, {mem_bucket_size : 'Number'}, {bool_no_exception : false});

   var modulo = word_list_length.count / row_tsr_config.mem_bucket_size;
   modulo = modulo > 2 ? 2 : Math.floor(modulo);
   return row_tsr_config['bucket_weight' + modulo]; //box_weight
}

function insert_word_weight ( user_id, word, first_language, target_language ) {
   return function ( box_weight ) {
      return  DB.get_db_adapter('TSR').exec_query(
         {action   : 'insert', entity : 'TSR_word_weight',
            values : {
               user_id                     : user_id,
               word                        : word,
               first_language              : first_language,
               target_language             : target_language,
               BOX_weight                  : box_weight,
               last_revision_time          : new Date(),
               last_revision_easyness      : 1,
               last_revision_exercise_type : 1,
               last_revision_grade         : 0//,
               //               last_mistake                : 0,
               //               last_word_distance          : 0
            }
         });
   }
}

function get_count_words ( user_id, fst_lg, tgt_lg ) {
   return DB.get_db_adapter('TSR')
      .exec_query({action     : 'count', entity : 'TSR_word_weight',
                     criteria : {
                        user_id         : user_id,
                        first_language  : fst_lg,
                        target_language : tgt_lg
                     }})
}

function get_specific_word_weight ( user_id, word, first_language, target_language ) {
   return DB.get_db_adapter('TSR')
      .exec_query({action     : 'select', entity : 'TSR_word_weight',
                     criteria : {
                        user_id         : user_id,
                        word            : word,
                        first_language  : first_language,
                        target_language : target_language
                     }})
}

function get_word_weights ( user_id, fst_lg, tgt_lg ) {
   return DB.get_db_adapter('TSR')
      .exec_query({action     : 'select',
                     entity   : 'TSR_word_weight',
                     criteria : {
                        user_id         : user_id,
                        first_language  : fst_lg,
                        target_language : tgt_lg
                     }
                  })
}

function update_word_weight_post_exo ( obj, callback ) {
   var analyzed_answer_merged = obj,
      word_weight_row = null,
      time_updated = null;
   /*   ok       : ok, correct_word : correct_word, answer : answer, time_taken_sec : time_taken_sec,
    mistake  : compute_word_mistake(correct_word, answer, word_info),
    time_analyzed:
    grade    : compute_grade(correct_word, answer, word_info), // NOT USED FOR NOW
    easyness : compute_easyness(correct_word, answer, word_info, time_taken_sec)
    */
   // TODO add a check of properties here
   return get_specific_word_weight(analyzed_answer_merged.user_id, analyzed_answer_merged.lemma,
                                   analyzed_answer_merged.first_language, analyzed_answer_merged.target_language)
      .then(function update_word_weight ( rows ) {
               word_weight_row = rows[0];
               if (!word_weight_row) {
                  return U.delegate_promise_error('update_word_weight_post_exo: get_specific_word_weight '
                                                     + 'found no rows in weight table for lemma '
                                                     + analyzed_answer_merged.lemma);
               }
               time_updated = analyzed_answer_merged.time_analyzed;

               // TODO: exercise type decide where to compute it : client vs. server, and how to compute it: for now 1
               return update_specific_word_weight(analyzed_answer_merged.user_id, analyzed_answer_merged.lemma,
                                                  analyzed_answer_merged.first_language, analyzed_answer_merged.target_language,
                                                  time_updated, analyzed_answer_merged.easyness,
                                                  analyzed_answer_merged.exercise_type ||
                                                  1, analyzed_answer_merged.grade)
                  .then(set_word_weight_hist(word_weight_row, time_updated));
            })
      .then(U.callback_ok(callback), callback);
}

function set_word_weight_hist ( word_weight_row, time_updated ) {
   return function ( promise_result ) {
      return DB.get_db_adapter('TSR').exec_query(
         {action   : 'insert',
            entity : 'TSR_word_weight_hist',
            values : U._extend(word_weight_row, {created_time : time_updated})
         }
      )
   }
}

function update_specific_word_weight ( user_id, lemma, fst_lg, tgt_lg, time, easyness, exercise_type, grade ) {
   return DB.get_db_adapter('TSR').exec_query(
      {action     : 'update',
         entity   : 'TSR_word_weight',
         criteria : {
            user_id         : user_id,
            word            : lemma,
            first_language  : fst_lg,
            target_language : tgt_lg
         },
         update   : {
            last_revision_time          : time,
            last_revision_easyness      : easyness,
            last_revision_exercise_type : exercise_type,
            last_revision_grade         : grade
         }
      });
}

function get_word_weights_cfg ( user_id ) {
   return DB.get_db_adapter('TSR')
      .exec_query({action     : 'select',
                     entity   : 'TSR_word_weight_cfg',
                     criteria : {
                        user_id : user_id
                     }
                  })
}

function get_word_notepad_info ( user_id, word, module, first_language, target_language ) {
   return DB.get_db_adapter('Notes')
      // NOTE: I don't need entity here as I registered the Notes adapter to be on a specific table already
      // Otherwise, I would need a mapping from Notes_Collection to the specific table
      // This will be useful when I will have several tables to organize the notes information
      .exec_query({action     : 'select',
                     criteria : {
                        module          : module,
                        lemma           : word,
                        user_id         : user_id,
                        first_language  : first_language,
                        target_language : target_language
                     }});
}

function get_word_to_memorize ( appState, callback ) {
   var check = U.assert_properties(appState, {user_id : 'Number'}, {bool_no_exception : false});
   if (!check.ok) {
      callback('get_word_to_memorize: parameter error\n' + check.results);
   }

   // Get the list of word and weight parameters for that user_id
   // Get the adapter for executing query
   var user_id = appState.user_id;
   RSVP.all([get_word_weights(user_id, appState.first_language, appState.target_language), get_word_weights_cfg(user_id)])
      .then(function compute_weight_and_select_word ( aDb_rows ) {
               // TODO : remove duplicate words? Or assume there are none (removed at another stage)
               // reminder specs for config rows are: pg_tsr_word_weight_cfg
               //for weight rows: pg_tsr_word_weight
               var weight_rows = aDb_rows[0],
                  weight_cfg_row = aDb_rows[1][0], // there must only be one
                  total_weight,
                  selected_word;
               if (aDb_rows[1].length !== 1) {
                  return U.delegate_promise_error('get_word_to_memorize: found several or no rows in TSR_word_weight_cfg table!');
               }
               if (weight_rows.length == 0) {
                  return "";
               }
               var check = U.assert_properties(weight_cfg_row,
                                               {age_param1          : 'Number', age_param2 : 'Number',
                                                  progress_param1   : 'Number', progress_param2 : 'Number',
                                                  difficulty_param1 : 'Number', difficulty_param2 : 'Number'},
                                               {bool_no_exception : false}).ok ||
                           U.assert_properties(weight_rows,
                                               {user_id                       : 'Number', word : 'String',
                                                  last_revision_time          : 'Number', last_revision_easyness : 'Number',
                                                  last_revision_exercise_type : 'Number', last_revision_grade : 'Number'},
                                               {bool_no_exception : false}).ok;
               if (!check) {
                  return U.delegate_promise_error('get_word_to_memorize: wrong data format extracted from weight tables');
               }

               var aWeights = TSR_compute_weight(weight_rows, weight_cfg_row);
               total_weight = aWeights.reduce(U.sum, 0);

               //get a randon number between 0 and total_weight
               var random_number = Math.random() * total_weight;
               var selected_index = get_weighted_index(random_number, aWeights);

               //return word at selected index
               selected_word = weight_rows[selected_index].word;
               //TODO : don't forget to implement a mechanism under which there is no more words to review
               return selected_word;
            })
      .then(get_word_info(user_id, 'reader tool', appState.first_language, appState.target_language))
      .then(U.callback_ok(callback), callback)
}

/**
 * Takes an array of weights and a weight index, and returns the corresponding index in the weight array
 * For instance:
 * aWeight = [90, 3, 4, 5], w_index = 95
 * -> returns 2, as 90 + 3 < 95 < 90 + 3 + 4
 * @param w_index {Number}
 * @param aWeights {Array}
 * @return {number}
 */
function get_weighted_index ( w_index, aWeights ) {
   var accu_weight = 0;
   var selected_index = 0;
   aWeights.some(function ( weight, index ) {
      if ((accu_weight <= w_index) && (w_index < accu_weight + weight)) {
         // stop scanning we keep index
         selected_index = index;
         return true;
      }
      else {
         accu_weight += weight;
      }
   });
   return selected_index;
}

function TSR_compute_weight ( weight_rows, weight_cfg_row ) {
   return weight_rows.map(function ( weight_row ) {
      var box_weight = weight_row.box_weight,
         age_component = tsr_compute_age(weight_row, weight_cfg_row),
         progress_component = tsr_compute_progress(weight_row, weight_cfg_row),
         difficulty_component = tsr_compute_difficulty(weight_row, weight_cfg_row);

      return box_weight * age_component * progress_component * difficulty_component;
   })
}

function get_word_user_translation ( user_id, selected_word, first_language, target_language ) {
   return DB.get_db_adapter('User_Translation')
      // NOTE: I don't need entity here as I registered the Notes adapter to be on a specific table already
      // Otherwise, I would need a mapping from Notes_Collection to the specific table
      // This will be useful when I will have several tables to organize the notes information
      .exec_query({action     : 'select',
                     entity   : 'word_user_translation',
                     criteria : {
                        lemma           : selected_word,
                        user_id         : user_id,
                        first_language  : first_language,
                        target_language : target_language
                     }});
}

/**
 * Returns all relevant information about a word/lemma.
 * TODO : That same function or maybe the calling function should return an exercise type (type word? MCQ? etc.)
 * @param {Number} user_id
 * @param {String} module
 * @param {String} first_language
 * @param {String} target_language
 * @returns {Function}
 */
function get_word_info ( user_id, module, first_language, target_language ) {
   return function ( selected_word ) {
      if (!selected_word) {
         return U.throw_promise_error('get_word_info: no/empty word passed as parameter!');
      }
      // Get : 1. notepad info, 2. current weight_info (used to compute the future weight)
      return RSVP.all([get_word_user_translation(user_id, selected_word, first_language, target_language),
                       get_word_notepad_info(user_id, selected_word, module, first_language, target_language),
                       get_specific_word_weight(user_id, selected_word, first_language, target_language)
                      ])
         //TODO add a query to get the sample sentence and user translation in User_Translation
         .then(function get_word_info_merge ( aPromiseResults ) {
                  return {
                     rowsUserTrans : aPromiseResults[0],
                     rowsNoteInfo  : aPromiseResults[1],
                     rowWordWeight : aPromiseResults[2][0] // should only be one
                  }
               },
               function error ( err ) {
                  console.log("error", err);
                  return new RSVP.Promise(function ( resolve, reject ) {reject(err);});
               })
   }
}
// compute age component as
// age_param1 * age_param2 ^ (now - last_revision_time in days)
// ASSUMPTION : argument checking is made before calling this function, so none is done here
function tsr_compute_age ( weight_row, weight_cfg_row ) {
   const day_in_ms = 86400000;
   var last_revision_time = Date.parse(weight_row.last_revision_time),
      now = new Date(),
      days_difference = (now - last_revision_time) / day_in_ms;
   return weight_cfg_row.age_param1 * Math.pow(weight_cfg_row.age_param2, days_difference);
}

/**
 * for now simple function returning the opposite of the parameter passed.
 * Note : this function is out of the sio_onGet_word_to_memorize, for performance reason
 *        It looks better to declare it once and for all instead of every time the sio_onGet_word_to_memorize
 *        is executed. It could also go in another module
 * @param weight_row {{last_revision_grade: *, last_revision_easyness: *, last_revision_exercise_type: *}}
 * @param weight_cfg_row {{progress_param1: *, progress_param2: *, difficulty_param1: *, difficulty_param2: *}}
 * @returns {number}
 */
function tsr_compute_progress ( weight_row, weight_cfg_row ) {
   /* This is NOT DONE HERE but when a word is finished revising (clicking on next button in GUI)
    New entries start with progress 0.
    If you find an answer easy, the item's progress is increased by 1.
    If you find an answer hard, the item's progress goes to min(int(previous / 2), previous - 1).
    If you get an answer wrong, the item's progress goes to min(-1, previous - 1).
    */

   // compute progress component as
   // progress_param1 * progress_param2 ^ (- f(last_revision_grade) )

   var last_revision_grade = weight_row.last_revision_grade,
      progress_power_factor = -last_revision_grade;
   return weight_cfg_row.progress_param1 * Math.pow(weight_cfg_row.progress_param2, progress_power_factor);
}

function tsr_compute_difficulty ( weight_row, weight_cfg_row ) {
   // the harder the word is to memorize, the higher the computed value
   // for now just use C / last_revision_easyness
   // i.e. easyness = 5 means easier than easyness = 1
   return weight_cfg_row.difficulty_param1 / weight_row.last_revision_easyness;
}

module.exports = {
   set_word_weights            : set_word_weights,
   get_word_to_memorize        : get_word_to_memorize,
   update_word_weight_post_exo : update_word_weight_post_exo
};
