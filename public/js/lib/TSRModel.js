/**
 * Created by bcouriol on 22/11/14.
 */
   // TODO: enable it to be loaded server and client side
   // NOTE : this is only client side
define(['utils'], function ( UT ) {
          function analyze_answer ( answer, word_info, exo_extra_info ) {
             // for now, just returning ok if the word is the same
             /* word_info   : {
              current_word      : word_to_memorize,
              rowsNoteInfo : rowsNoteInfo,
              rowsUserTrans : translation chosen by the user for the lemma/word and maybe some example sentences
              rowWordWeight : rowWordWeight
              + timeSubmitted
              + timeCreated
              }
              exo_extra_info : - word_distance, - mistake, - trial_number (1-n)
              */
             var aCorrectWords = word_info.rowsUserTrans.map(function ( rowUserTrans ) {return rowUserTrans.lemma_translation});
             logWrite(DBG.TAG.DEBUG, 'possible translations', aCorrectWords);
             var ok = (aCorrectWords.indexOf(answer) > -1);
             var time_taken_sec = word_info.timeSubmitted - word_info.timeCreated;
             var distance_to_correct_word = aCorrectWords
                .map(function ( correct_word ) {return UT.getEditDistance(correct_word, answer); })
                .reduce(UT.min);
             var mistake = compute_word_mistake(aCorrectWords, answer, word_info);
             var last_mistake = exo_extra_info.last_mistake;
             var last_word_distance = exo_extra_info.last_word_distance;

             return {
                analyzed_answer : {
                   ok              : ok, aCorrectWords : aCorrectWords, answer : answer,
                   lemma           : word_info.current_word,
                   first_language  : word_info.rowsUserTrans[0].first_language,
                   target_language : word_info.rowsUserTrans[0].target_language,
                   time_taken_sec  : time_taken_sec, time_analyzed : word_info.timeSubmitted,
                   mistake         : mistake,
                   grade           : compute_grade(aCorrectWords, answer, word_info, exo_extra_info),
                   easyness        : compute_easyness(aCorrectWords, answer, word_info, time_taken_sec)
                },
                exo_extra_info  : {
                   last_mistake       : mistake,
                   last_word_distance : distance_to_correct_word
                }
             }
          }

          function compute_word_mistake ( aCorrectWords, answer, word_info ) {
             // TODO : run a series of common mistake checks, for example
             // word is the same if we forget about accent
             // word is the same if we forget about CAPS
             // word is the same if we forget one permutation of adjacent letters (similar to ispell)
             // word has a list of common mistakes, and the answer is in that list
             // But for now do nothing
             return "TODO";
          }

          function compute_grade ( aCorrectWords, answer, word_info, exo_extra_info ) {
             // IMPORTANT : This is coupled to the final formula
             // for now it is progress component as Cn^-grade, where grade is increasing with performance

             /* !! total grade is a increasing function of performance, grade here is the diff.
              That diff is a function of the number of trials, and the enormity of the previous mistake
                Should theoretically depend on enormity of PRESENT MISTAKE but in fact because the last answer
                before updating on server side is by design right, we actually have it depending on the PREVIOUS MISTAKE
              In formula, grade increase with progress, so there is a conversion here to make
              (d_t_correct_word, fsm.current (state))
              (0, EXO)      : += 1 // found at first attempt, max increase
              (0, EXO_HINT) : last_word_distance <= 1 -> += 0 // found after one hint, small mistake, no increase
              last_word_distance > 2 -> += -1 // found after one hint, big mistake, decrease 1
              (0, EXO_REP)  :  -> min (-1, old-2) // does not matter the past, put it for priority reviewal
              (_, *)      :  -> same as for 0, *
              In that case, it does not really matter for now, as we do nothing with intermediate results
              IDEA : we could use the actual compute_new_grade - distance_to_correct_word
                     as higher grades means greater repetition spacing = higher recall performance
                     when distance_to_correct_word = 0, we have the same formula
                     when not, performance = grade is a decreasing function of the mistake (distance to correct word)
              */
             function compute_new_grade ( current_grade, trial_number, distance_to_correct_word, last_word_distance ) {
                // TODO EN COURS
                // NOTE : does not depend on distance_to_correct_word arguments in this version of implementation
                // cf. comments above
                switch (trial_number) {
                   case 1 :
                      return current_grade + 1;
                      break;
                   case 2 :
                      return current_grade + (last_word_distance <= 2 ? 0 : -1);
                      break;
                   case 3 :
                      return Math.min(-1, current_grade - 2);
                      break;
                   default:
                      break;
                }
/*
                switch (distance_to_correct_word) {
                   case 0 : // perfect answer
                      return current_grade + 1;
                      break;
                   case 1: // 1 mistake, maybe accent?
                      return  current_grade;
                      break;
                   case 2: // 2 mistakes, maybe 2 accents, or inversion of letters?
                      return current_grade - 0.5;
                      break;

                   default: // this should be the 3+ case as word_distance is positive
                      return Math.min(-1, current_grade - 1);
                      break;
                }
 */
             }

             var distance_to_correct_word = aCorrectWords
                .map(function ( correct_word ) {return UT.getEditDistance(correct_word, answer); })
                .reduce(UT.min);
             var last_word_distance = exo_extra_info.last_word_distance;
             var trial_number = exo_extra_info.trial_number;
             var current_grade = word_info.rowWordWeight.last_revision_grade;
             logWrite(DBG.TAG.DEBUG, 'word_distance', distance_to_correct_word);
             return compute_new_grade(current_grade, trial_number, distance_to_correct_word, last_word_distance);
          }

          function compute_easyness ( aCorrectWords, answer, word_info, time_taken ) {
             // returns a value between 0,5 and 1,5
             // could be calculated as a function of is_correct, time_taken
             // fast x wrong answer --> 1
             // fast x good answer --> 1,5
             // slow x wrong answer -> 0,5
             // slow x good answer --> 1
             // fast and slow TO BE DEFINED
             return 1;
          }

          return {
             analyze_answer       : analyze_answer,
             compute_word_mistake : compute_word_mistake,
             compute_grade        : compute_grade,
             compute_easyness     : compute_easyness
          }
       }
)
;
