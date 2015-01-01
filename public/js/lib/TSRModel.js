/**
 * Created by bcouriol on 22/11/14.
 */
   // TODO: enable it to be loaded server and client side
   // NOTE : this is only client side
define(['utils'], function ( UT ) {
          function analyze_answer ( answer, word_info ) {
             // for now, just returning ok if the word is the same
             /* word_info   : {
              current_word      : word_to_memorize,
              rowsNoteInfo : rowsNoteInfo,
              rowsUserTrans : translation chosen by the user for the lemma/word and maybe some example sentences
              rowWordWeight : rowWordWeight
              + timeSubmitted
              + timeCreated
              } */
             var aCorrectWords = word_info.rowsUserTrans.map(function(rowUserTrans) {return rowUserTrans.lemma_translation});
             logWrite(DBG.TAG.DEBUG, 'possible translations', aCorrectWords);
             var ok = (aCorrectWords.indexOf(answer) > -1);
             var time_taken_sec = word_info.timeSubmitted - word_info.timeCreated;

             return {
                ok             : ok, aCorrectWords : aCorrectWords, answer : answer,
                lemma : word_info.current_word,
                first_language: word_info.rowsUserTrans[0].first_language,
                target_language: word_info.rowsUserTrans[0].target_language,
                time_taken_sec : time_taken_sec, time_analyzed : word_info.timeSubmitted,
                mistake        : compute_word_mistake(aCorrectWords, answer, word_info),
                grade          : compute_grade(aCorrectWords, answer, word_info), // NOT USED FOR NOW
                easyness       : compute_easyness(aCorrectWords, answer, word_info, time_taken_sec)
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

          function compute_grade ( aCorrectWords, answer, word_info ) {
             // IMPORTANT : This is coupled to the final formula
             // for now it is progress component as Cn^-grade, where grade is increasing with performance

             // if grade = 0 no mistake, the bigger the worse
             // In formula, grade increase with progress, so there is a conversion here to make
             // grade_in : 0 -> grade_out +: 1
             // grade_in : 1 -> grade_out +: 0
             // grade in : 2 -> grade_out -: 1/2
             // grade in : 3+ -> grade_out =: min (-1, old-1), so I need the old values
             function compute_new_grade ( current_grade, word_distance ) {
                switch (word_distance) {
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
             }

             var current_grade = word_info.rowWordWeight.last_revision_grade;
             var word_distance = aCorrectWords.map(function(correct_word) {return UT.getEditDistance(correct_word, answer)}).reduce (function (prev,next) {return prev < next ? prev : next});
             logWrite(DBG.TAG.DEBUG, 'word_distance', word_distance);
             return compute_new_grade(current_grade, word_distance);
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
);
