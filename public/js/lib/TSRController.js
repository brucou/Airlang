/**
 * Created by bcouriol on 22/11/14.
 * Spec and algorithm in TSR.md
 */

define(['jquery', 'state-machine', 'mustache', 'TSRModel', 'socket', 'utils'], function ( $, STM, MUSTACHE, TSRM, SOCK, UT ) {
   // define config object with its defect values
   var cfg = {};
   var TSR = {};

   TSR.config = function config ( cfg ) {
      // copy all own props of cfg into private var cfg
   };

   // Views and corresponding view adapters
   // View adapter contain the {{parameters}} used in view templates and their setters
   TSR.mainView = can.view('tpl-tsr-tool-main');
   TSR.EXO_view = can.view('tpl-tsr-tool-exo');
   //   TSR.EXO_HINT_view = can.view('tpl-tsr-tool-exo-hint');
   //   TSR.EXO_REP_view = can.view('tpl-tsr-tool-exo-rep');

   TSR.EXO_controller = can.Control.extend(
      //static property of control is first argument
      { defaults : {}
      }, {
         // for now very simple viewAdapter, e.g. no reactive component
         viewAdapter : new can.Map(
            { tsr_exo_hint        : "z", // no hint displayed by default at init
               tsr_exo_rep        : "",
               answer_status      : "white",
               id_tsr_answer      : 'airlang-tsr-answer',
               $id_tsr_answer     : $('#airlang-tsr-answer'),
               get_input_text     : function () {
                  return document.getElementById(this.id_tsr_answer).value;
               },
               set_answer_status  : function ( status ) {
                  this.attr('answer_status', status);
               },
               empty_hint         : function () {
                  this.attr("tsr_exo_hint", "");
               },
               empty_answer_input : function () {document.getElementById(this.id_tsr_answer).value = "";},
               set_hint           : function ( html_s ) {this.attr('tsr_exo_hint', html_s)}
            }),

         init : function ( $el, options ) {
            logWrite(DBG.TAG.INFO, "initializing TSR EXO Controller with options", options);
            var sub_controller = this;
            // !! BUG don't know why I have to do that but the triggering do not work if I use the jQuery corresponding el
            this.stateMap = this.options.stateMap;
            this.word_info = this.options.word_info;
            this.fsm = this.options.fsm; // statemachine object which will be queried to know state of main controller
            this.exo_extra_info = {
               trial_number       : 0,
               last_mistake       : null,
               last_word_distance : 0
            }; // initialized to empty object, will be filled with additional info for grading

            // Show the view
            $el.html(TSR.EXO_view(this.viewAdapter));
         },

         'submit' : function ( $el, ev ) {
            ev.preventDefault();
            logWrite(DBG.TAG.DEBUG, 'submit event received');
            console.log($el);
            var exo_controller = this;
            var $input = $('#' + this.viewAdapter.id_tsr_answer);
            var answer = $input.val().trim();
            logWrite(DBG.TAG.DEBUG, 'value entered', answer);
            exo_controller.word_info.timeSubmitted = new Date();

            // validate answer return ok: bool, mistake: some idea of the mistake
            // TODO: mistake analysis
            // minimally this is the wrong word entered and description of mistake
            // - only accents, otherwise perfect,
            // - part of list of common spelling mistakes for that word (first_language dependent)

            // Update the trial number, it is used for grading the recall
            // Other fields are not relevant on first trial but are later initialized at the first answer analysis
            exo_controller.exo_extra_info.trial_number =
            exo_controller.fsm.get_trial_number_from_fsm_state(exo_controller.fsm.current);
            // pass all relevant data for the grading
            var analyzed = TSRM.analyze_answer(answer, exo_controller.word_info, exo_controller.exo_extra_info);
            var analyzed_answer = analyzed.analyzed_answer;
            // and update the
            exo_controller.exo_extra_info = analyzed.exo_extra_info;
            logWrite(DBG.TAG.DEBUG, 'analyzed result', UT.inspect(analyzed));

            // send event corresponding to validation
            logWrite(DBG.TAG.EVENT, analyzed_answer.ok ? 'EXO_OK' : 'EXO_NOK', 'emitting');
            exo_controller.element.trigger(analyzed_answer.ok ? 'EXO_OK' : 'EXO_NOK', analyzed_answer);
            return false;
            // Note : it is the controller who decides to create and destroy its subcontrollers
            // mistake identification will not be done at client level or we need a drop down
            // maybe in REP stage
         },

         'input' : function ( $el, ev ) {
            var exo_controller = this;
            //logWrite(DBG.TAG.DEBUG, "event target", ev.target.getAttribute('id'));
            if (exo_controller.fsm.is('EXO_REP') && UT.getTargetID(ev) === exo_controller.viewAdapter.id_tsr_answer) {
               logWrite(DBG.TAG.EVENT, "input event", ev.target);
               exo_controller.process_key_input(//ev.keyCode,
                  exo_controller.viewAdapter.get_input_text(),
                  exo_controller.word_info.rowsUserTrans);
            }
            return true; // continue with the default treatment which is to show on screen the key
         },

         'al-ev-tsr-exo-ctrl-empty' : function ( $el, ev, word_info ) {
            console.log(ev);
            word_info = ev.word_info || word_info;

            logWrite(DBG.TAG.EVENT, "al-ev-tsr-exo-ctrl-empty", "received with args", word_info);
            this.exo_ctrl_empty(word_info);
         },

         'al-ev-tsr-exo-ctrl-show-hint' : function ( $el, ev, word_info ) {
            word_info = ev.word_info || word_info;

            logWrite(DBG.TAG.EVENT, "al-ev-tsr-exo-ctrl-hint", "received with args", word_info);
            console.log("al-ev-tsr-exo-ctrl-show-hint: state machine in state", this.fsm.current);
            this.show_hint(word_info, this.fsm.current);
         },

         exo_ctrl_empty : function exo_ctrl_empty ( word_info ) {
            console.log("emptying");
            this.viewAdapter.empty_hint(); // remove any hint that could be previously lingering on there
            this.viewAdapter.empty_answer_input(); // and clean the input text
            this.word_info = word_info;
            this.word_info.timeCreated = new Date();
            //this.viewAdapter.set_hint(word_info.rowsUserTrans[0]);
         },

         process_key_input : function ( /*keyCode,*/ input, rowsUserTrans ) {
            var exo_controller = this;
            /* we check that the input correspond to the beginning of one of the word in rowsUserTrans
             // (possible translations) */
            var found = false;
            //input = input + String.fromCharCode(keyCode);
            rowsUserTrans.some(function ( rowUserTrans, index ) {
               var possible_trans = rowUserTrans.lemma_translation;
               if (input.length <= possible_trans.length && UT.startsWith(possible_trans, input)) {
                  logWrite(DBG.TAG.DEBUG, 'possible translation found', possible_trans);
                  return found = true;
               }
               return false;
            });

            //TODO : add a close status, for when it is just an accent error
            exo_controller.viewAdapter.set_answer_status(found ? 'right' : 'wrong');
         },

         show_hint : function ( word_info, fsm_state ) {
            // html format the hint sentences info
            // we have two set of example sentences
            // each of which can have several possible translations (polysemic words)
            // start with the one chosen by the user (in user translation)
            this.viewAdapter.set_hint(this.format_hint_sentences(word_info, fsm_state));
         },

         format_hint_sentences : function ( word_info, fsm_state ) {
            /* word_info   : {
             current_word      : word_to_memorize,
             rowsNoteInfo : rowsNoteInfo,
             rowsUserTrans : translation chosen by the user for the lemma/word and maybe some example sentences
             rowWordWeight : rowWordWeight
             + timeSubmitted
             + timeCreated
             }
             fsm_state {string} : information about the state of the fsm machine (EXO, EXO_HINT, EXO_REP etc.
             */
            var tpl = [];
            tpl.push("<table class='al-tsr-hint-tbl' data-content='hint_table'>",
                     "<thead>",
                     "  <tr>",
                     "    <th>Your chosen translations</th>",
                     "  </tr>",
                     "</thead>",
                     "<tbody>",
                     "{{#user_translations}}",
                     "  <tr class='{{toggle_hide}}'>",
                     "    <td>{{lemma_translation}}</td>",
                     "  </tr><tr class='{{toggle_hide}}'>",
                     "    <td>{{sample_sentence_first_lg}}</td>",
                     "  </tr><tr>",
                     "    <td><strong>{{sample_sentence_target_lg}}</strong></td>",
                     "  </tr>",
                     "{{/user_translations}}",
                     "</tbody>",
                     "</table>",
                     "<table class='al-tsr-hint-tbl' data-content='hint_table'>",
                     "<thead>",
                     "  <tr>",
                     "    <th>From your notes</th>",
                     "  </tr>",
                     "</thead>",
                     "<tbody>",
                     "{{#rowsNoteInfo}}",
                     "  <tr>",
                     "    <td>{{context_sentence}}</td>",
                     "  <tr></tr>",
                     "{{/rowsNoteInfo}}",
                     "</tbody>",
                     "</table>");
            var template = tpl.join("\n");

            var html_text = MUSTACHE.render(template,
                                            {toggle_hide         : fsm_state === 'EXO_HINT' ? 'al-hide' : '',
                                               user_translations : word_info.rowsUserTrans,
                                               rowsNoteInfo      : word_info.rowsNoteInfo});
            return html_text;
         }
      });

   TSR.mainController = can.Control.extend(
      //static property of control is first argument
      { defaults : {}
      }, {
         // Finite state machine
         fsm             : null,
         // Creating the adapter as part of the controller, so this is a controller instance variable
         mainViewAdapter : new can.Map(
            { current_word           : "",
               current_word_PoS      : "",
               id_exercise_container : 'airlang-tsr-exercise-container',
               set_current_word      : function ( word, word_pos ) {
                  this.attr("current_word", word);
                  this.attr("current_word_PoS", word_pos);
               }
            }),

         init : function ( $el, options ) {
            logWrite(DBG.TAG.INFO, "initializing TSR Controller with options", options);
            var controller = this;
            this.stateMap = this.options.appState;

            // Show the view
            $el.html(TSR.mainView(this.mainViewAdapter));

            //Create and start the state machine
            this.fsm = this.createStateMachine();
            // adding helper function which translate the state into the number of current attempt
            this.fsm.get_trial_number_from_fsm_state = function ( sState ) {
               switch (sState) {
                  case 'EXO' :
                     return 1;
                  case 'EXO_HINT' :
                     return 2;
                  case 'EXO_REP' :
                     return 3;
                  default:
                     throw 'get_trial_number_from_fsm_state: unknown state - cannot translate to trial number';
                     break;
               }
            };

            this.fsm.start();

            // Initialize the controller AFTER showing the view, otherwise the id used in the view do not exist on the page
            this.EXO_controller =
            new TSR.EXO_controller('#' + this.mainViewAdapter.id_exercise_container,
                                   {stateMap    : controller.stateMap,
                                      fsm       : this.fsm,
                                      target    : '#' + this.mainViewAdapter.id_exercise_container,
                                      word_info : controller.stateMap.word_info});
         },

         '#airlang-tsr-exercise-container EXO_OK' : function ( $el, ev, analyzed_answer ) {
            var controller = this;
            logWrite(DBG.TAG.DEBUG, 'event EXO_OK received in main controller');
            logWrite(DBG.TAG.DEBUG, 'args received', UT.inspect(analyzed_answer));
            controller.stateMap.analyzed_answer = analyzed_answer;

            // Go to next state (state NEXT)
            controller.fsm.ok();
         },

         '#airlang-tsr-exercise-container EXO_NOK' : function ( $el, ev ) {
            var controller = this;
            logWrite(DBG.TAG.DEBUG, 'event EXO_NOK received in main controller');
            // advance to next state in state machine
            controller.fsm.nok();
         },

         createStateMachine : function createStateMachine () {
            var controller = this;
            var fsm = STM.create({
                                    initial   : 'INIT',
                                    events    : [
                                       { name : 'start', from : 'INIT', to : 'EXO' },
                                       { name : 'ok', from : ['EXO', 'EXO_HINT', 'EXO_REP'], to : 'NEXT' },
                                       { name : 'nok', from : 'EXO', to : 'EXO_HINT' },
                                       { name : 'nok', from : 'EXO_HINT', to : 'EXO_REP' },
                                       { name : 'next', from : 'NEXT', to : 'EXO'  },
                                       { name : 'end', from : 'NEXT', to : 'EXIT'  }
                                    ],
                                    error     : function ( eventName, from, to, args, errorCode, errorMessage, exception ) {
                                       // TODO : detect the abort event
                                       if (eventName === 'abort') {
                                          abort();
                                          // execute abort handler
                                       }
                                       else {
                                          logWrite(DBG.TAG.ERROR, "error occurred while operating state machine",
                                                   'event ' + eventName + ' : ' + (exception || errorMessage));
                                          console.log(exception);
                                          throw '"error occurred while operating state machine"' +
                                                'event ' + eventName + ' : ' + (exception || errorMessage);
                                          //TODO: and then what? fail silently? or close the window and pass an error up?
                                       }
                                    },
                                    callbacks : {
                                       onINIT : function onINIT ( event, from, to, args ) {
                                          logWrite(DBG.TAG.INFO, "Machine initialized");
                                       }
                                       // So far unused. This is here because it is called at creation time
                                    }});

            // callback handling state transitions
            fsm.onEXO = function onEXO ( event, from, to, args ) {
               //HELPER FUNCTION
               function filter_prop_EXO ( stateMap ) {
                  return UT.filter_out_prop_by_type(stateMap, ['jQuery', 'Element']);
               }

               logWrite(DBG.TAG.INFO, "Entered EXO state");
               var stateMap = controller.stateMap;
               // !!!!! Cannot emit object with too many properties
               // as socket.io does a recursive search for binary prop which
               // exceeds stack size (and take time)
               // So for example no jQuery element
               logWrite(DBG.TAG.SOCK, "get_word_to_memorize", "emitting stateMap");
               SOCK.RSVP_emit('get_word_to_memorize', filter_prop_EXO(stateMap))
                  .then(
                  function get_word_to_memorize_success ( result ) {
                     logWrite(DBG.TAG.DEBUG, 'result', UT.inspect(result, null, 3));
                     var rowsUserTrans = result.rowsUserTrans;
                     var rowsNoteInfo = result.rowsNoteInfo;
                     var rowWordWeight = result.rowWordWeight;

                     //NOTE : there might be several rows in rowsNoteInfo but they should all have the same word by construction
                     var word_to_memorize = rowWordWeight.word;
                     // TODO: move to EXO_HINT, no use elsewhere a priori
                     var aExampleSentences = rowsNoteInfo.map(UT.get_prop('context_sentence'));
                     logWrite(DBG.TAG.DEBUG, 'exemple sentences', UT.inspect(aExampleSentences));

                     controller.stateMap.word_info = {
                        current_word  : word_to_memorize, // keep it because it is the fundamental unit here
                        rowsNoteInfo  : rowsNoteInfo,
                        rowWordWeight : rowWordWeight,
                        rowsUserTrans : rowsUserTrans
                     };

                     controller.mainViewAdapter.set_current_word(word_to_memorize, "PoS: TOBEDONE");
                     $('#airlang-tsr-word-current').html(word_to_memorize);

                     logWrite(DBG.TAG.EVENT, "al-ev-tsr-exo-ctrl-empty", "emitting");
                     console.log('word_info', controller.stateMap.word_info,
                                 controller.stateMap.word_info.rowsUserTrans[0].lemma_translation);
                     can.trigger(document.getElementById(controller.mainViewAdapter.id_exercise_container),
                                 'al-ev-tsr-exo-ctrl-empty',
                                 controller.stateMap.word_info);
                  },

                  function get_word_to_memorize_error ( err ) {
                     if (err.stack) {
                        logWrite(DBG.TAG.ERROR, 'stack:', err.stack);
                     }
                     logWrite(DBG.TAG.ERROR, 'error:', UT.inspect(err, null, 3));
                     return $(stateMap.error_div).html(err.toString());
                  }
               );
            };

            fsm.onEXO_HINT = function onEXO_HINT ( event, from, to, args ) {
               logWrite(DBG.TAG.INFO, "Entered EXO_HINT state");

               // show hint sentences
               can.trigger(document.getElementById(controller.mainViewAdapter.id_exercise_container),
                           'al-ev-tsr-exo-ctrl-empty',
                           controller.stateMap.word_info);
               can.trigger(document.getElementById(controller.mainViewAdapter.id_exercise_container),
                           'al-ev-tsr-exo-ctrl-show-hint',
                           controller.stateMap.word_info);
            };

            fsm.onEXO_REP = function onEXO_REP ( event, from, to, args ) {
               logWrite(DBG.TAG.INFO, "Entered EXO_REP state");
               // show hint sentences
               can.trigger(document.getElementById(controller.mainViewAdapter.id_exercise_container),
                           'al-ev-tsr-exo-ctrl-empty',
                           controller.stateMap.word_info);
               can.trigger(document.getElementById(controller.mainViewAdapter.id_exercise_container),
                           'al-ev-tsr-exo-ctrl-show-hint',
                           controller.stateMap.word_info);

               // TODO : Here we want to process each key and if it is wrong letter then change color till good answer full
               // also if more words, change color
               // if letter is ok but wrong accent, another color
            };

            fsm.onNEXT = function onNEXT ( event, from, to, args ) {
               //
               logWrite(DBG.TAG.INFO, "Entered NEXT state");
               // Store the result of the word exercise
               // Ask for next word TODO: impossible, necessary link from EXO to EXIT, and NEXT to EXO
               // If no more then go to exit
               var stateMap = controller.stateMap;

               logWrite(DBG.TAG.SOCK, "Emitting update_word_weight_post_tsr_exo (user_id not shown)", UT.inspect(stateMap.analyzed_answer));
               SOCK.RSVP_emit('update_word_weight_post_tsr_exo',
                              UT._extend(stateMap.analyzed_answer, {user_id : stateMap.user_id}))
                  .then(
                  function update_word_weight_post_tsr_exo_success ( result ) {
                     // result comes from just an update so nothing much interesting should be there
                     // maybe some info to check that the operation was successful
                     // So go directly to next state (back to EXO state)
                     logWrite(DBG.TAG.DEBUG, "result from update_word_weight", UT.inspect(result));
                     fsm.next();
                  });
            };

            fsm.onEXIT = function onEXIT ( event, from, to, args ) {

            };
            return fsm;
         }

      })
   ;

   function abort () {
      // TODO : used if the user close the window while in the middle of a TSR session
   }

   TSR.init = function init () {

   };

   return TSR;
})
;
