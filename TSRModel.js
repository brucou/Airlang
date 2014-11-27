/**
 * Created by bcouriol on 27/11/14.
 */

var LOG = require('./debug'),
   DB = require('./db_logic'),
   Util = require('util'),
   U = require('./public/js/lib/utils'), // load the client side utils
   RSVP = require('rsvp');

// Memorization module handlers
function set_word_weights ( obj, callback ) {
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
               ).then(callback_ok(callback), error_handler(callback));
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

function get_word_to_memorize ( appState, callback ) {
   var user_id = appState.user_id;
   if (!user_id) {
      callback('sio_onGet_word_to_memorize: param appState.user_id has falsy value - aborting');
   }

   // Get the list of word and weight parameters for that user_id
   // Get the adapter for executing query
   var dbAdapter = DB.get_db_adapter('sio_onGet_word_to_memorize');
   RSVP.all([dbAdapter.exec_query({action     : 'select',
                                     entity   : 'TSR_word_weight',
                                     criteria : {
                                        user_id : user_id
                                     }
                                  }),
             dbAdapter.exec_query({action     : 'select',
                                     entity   : 'TSR_word_weight_cfg',
                                     criteria : {
                                        user_id : user_id
                                     }
                                  })
            ])
      .then(function ( aDb_rows ) {
               // TODO : remove duplicate words? Or assume there are none (removed at another stage)
               /* reminder specs for config rows are:
                user_id INTEGER,
                mem_bucket_size SMALLINT,
                age_param1 SMALLINT,
                age_param2 SMALLINT,
                progress_param1 SMALLINT,
                progress_param2 SMALLINT,
                difficulty_param1 SMALLINT,
                difficulty_param2 SMALLINT,
                bucket_weight0 SMALLINT,
                bucket_weight1 SMALLINT,
                bucket_weight2 SMALLINT,
                bucket_weight3 SMALLINT,
                */
               /*
                for weight rows:
                id SERIAL,
                user_id INTEGER,
                word character varying,
                box_weight INTEGER,
                last_revision_time character varying,
                last_revision_easyness SMALLINT,
                last_revision_exercise_type SMALLINT,
                last_revision_grade SMALLINT
                */
               var weight_rows = aDb_rows[0],
                  weight_cfg_row = aDb_rows[1][0], // there must only be one
                  total_weight,
                  selected_word;
               if (aDb_rows[1].length !== 1) {
                  throw 'get_word_to_memorize: found several rows in TSR_word_weight_cfg table!'
               }

               var aWeights = weight_rows.map(function ( weight_row ) {
                  var box_weight = weight_row.box_weight,
                     age_component = tsr_compute_age(weight_row, weight_cfg_row),
                     progress_component = tsr_compute_progress(weight_row, weight_cfg_row),
                     difficulty_component = tsr_compute_difficulty(weight_row, weight_cfg_row);

                  return box_weight * age_component * progress_component * difficulty_component;
               });
               total_weight = aWeights.reduce(function ( prev, next ) {return prev + next}, 0);

               //get a randon number between 0 and total_weight
               var random_number = Math.random() * total_weight;
               var accu_weight = 0;
               var selected_index = 0;
               aWeights.some(function ( weight, index ) {
                  if ((accu_weight <= random_number) && (random_number < accu_weight + weight)) {
                     // stop scanning we keep index
                     selected_index = index;
                     return true;
                  }
                  else {
                     accu_weight += weight;
                  }
               });
               //return word at selected index
               selected_word = weight_rows[selected_index].word;
               return selected_word;
            })
}

// compute age component as
// age_param1 * age_param2 ^ (now - last_revision_time in days)
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
   set_word_weights     : set_word_weights,
   get_word_to_memorize : get_word_to_memorize
};
