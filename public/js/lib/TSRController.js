/**
 * Created by bcouriol on 22/11/14.
 * Spec and algorithm in TSR.md
 */

define(['jquery', 'state-machine', 'TSRModel', 'socket', 'utils'], function ( $, STM, TSRM, SOCK, UT ) {
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
         viewAdapter : undefined,

         init : function ( $el, options ) {
            logWrite(DBG.TAG.INFO, "initializing TSR EXO Controller with options", options);
            var sub_controller = this;
            this.appState = this.options.appState;
            this.word_info = this.options.word_info;

            // Show the view
            $el.html(TSR.EXO_view());
         },

         reinit : function reinit ( word_info ) {
            this.element.html(TSR.EXO_view());
            this.word_info = word_info;
            this.word_info.timeCreated = new Date();

            //#answer
         },

         'submit' : function ( $el, ev ) {
            ev.preventDefault();
            logWrite(DBG.TAG.DEBUG, 'submit event received');
            console.log($el);
            var exo_controller = this;
            var $input = $('#airlang-tsr-answer');
            var answer = $input.val().trim();
            logWrite(DBG.TAG.DEBUG, 'value entered', answer);
            exo_controller.word_info.timeSubmitted = new Date();

            // validate result
            // validate answer return ok: bool, mistake: some idea of the mistake
            // specData is information about the word that allows to find the mistake
            // or to evaluate correctness
            // minimally this is only the word in the same form it was stored
            // it could also the word in lemma form, the word without punct. signs,
            // a list of common spelling mistakes etc.
            //{answer, time_taken_sec, mistake, grade, easyness}
            var analyzed_answer = TSRM.analyze_answer(answer, exo_controller.word_info);
            logWrite(DBG.TAG.DEBUG, 'analyzed answer', UT.inspect(analyzed_answer));

            // send event corresponding to validation
            exo_controller.element.trigger(analyzed_answer.ok ? 'EXO_OK' : 'EXO_NOK', analyzed_answer);
            // Note : it is the controller who decides to create and destroy its subcontrollers
            // mistake identification will not be done at client level or we need a drop down
            // maybe in REP stage
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
            { current_word      : "",
               current_word_PoS : "",
               set_current_word : function ( word, word_pos ) {
                  this.attr("current_word", word);
                  this.attr("current_word_PoS", word_pos);
               }
            }),

         init : function ( $el, options ) {
            logWrite(DBG.TAG.INFO, "initializing TSR Controller with options", options);
            var controller = this;
            this.appState = this.options.appState;

            this.EXO_HINT_controller = this.EXO_REP_controller = undefined;

            // Show the view
            $el.html(TSR.mainView(this.mainViewAdapter));

            // Initialize the controller AFTER showing the view, otherwise the id used in the view do not exist on the page
            this.EXO_controller =
            new TSR.EXO_controller('#airlang-tsr-exercise-container',
                                   {appState    : controller.appState,
                                      word_info : controller.appState.word_info});

            //Create and start the state machine
            this.fsm = this.createStateMachine();
            this.fsm.start();

            // TODO :
         },

         '#airlang-tsr-exercise-container EXO_OK' : function ( $el, ev, analyzed_answer ) {
            var controller = this;
            logWrite(DBG.TAG.DEBUG, 'event EXO_OK received in main controller');
            logWrite(DBG.TAG.DEBUG, 'args received', UT.inspect(analyzed_answer));
            controller.appState.analyzed_answer = analyzed_answer;

            // Go to next state (state NEXT)
            controller.fsm.ok();
         },

         '#airlang-tsr-exercise-container EXO_NOK' : function ( $el, ev ) {
            var controller = this;
            logWrite(DBG.TAG.DEBUG, 'event EXO_NOK received in main controller');
            // advance to next state in state machine
            // TODO: Think about if I need to pass value
            // put value in controller accessible by all modules?
            // or pass value around via args of event triggered?
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
                                          throw '"error occurred while operating state machine"' +
                                          'event ' + eventName + ' : ' + (exception || errorMessage);
                                          //TODO: and then what? fail silently? or close the window and pass an error up?
                                       }
                                    },
                                    callbacks : {
                                       onINIT : function onINIT ( event, from, to, args ) {
                                          console.log("Machine initialized");
                                       }
                                       // So far unused. This is here because it is called at creation time
                                    }});

            // callback handling state transitions
            fsm.onEXO = function onEXO ( event, from, to, args ) {
               //HELPER FUNCTION
               function filter_prop_EXO ( appState ) {
                  return UT.filter_out_prop_by_type(appState, ['jQuery', 'Element']);
               }

               // Get the schedules
               logWrite(DBG.TAG.INFO, "Entered EXO state");
               //TODO : get next word remotely asking
               var appState = controller.appState;
               // !!!!! Cannot emit object with too many properties
               // as socket.io does a recursive search for binary prop which
               // exceeds stack size (and take time)
               // So for example no jQuery element
               SOCK.RSVP_emit('get_word_to_memorize', filter_prop_EXO(appState))
                  .then(
                  function get_word_to_memorize_success ( result ) {
                     /* Result (cf. server TSRModel.get_word_to_memorize.get_word_info
                      rowsNoteInfo  : aPromiseResults[0],
                      rowWordWeight : aPromiseResults[1][0]
                      */
                     logWrite(DBG.TAG.DEBUG, 'result', UT.inspect(result, null, 3));
                     var rowsNoteInfo = result.rowsNoteInfo;
                     var rowWordWeight = result.rowWordWeight;

                     //NOTE : there might be several rows in rowsNoteInfo but they should all have the same word by construction
                     var word_to_memorize = rowWordWeight.word;
                     // TODO: move to EXO_HINT, no use elsewhere a priori
                     var aExampleSentences = rowsNoteInfo.map(UT.get_prop('context_sentence'));
                     logWrite(DBG.TAG.DEBUG, 'exemple sentences', UT.inspect(aExampleSentences));

                     controller.appState.word_info =
                     {current_word   : word_to_memorize, // keep it because it is the fundamental unit here
                        rowsNoteInfo : rowsNoteInfo, rowWordWeight : rowWordWeight};

                     controller.mainViewAdapter.set_current_word(word_to_memorize, "PoS: TOBEDONE");
                     $('#airlang-tsr-word-current').html(word_to_memorize);
                     controller.EXO_controller.reinit(controller.appState.word_info);

                  },

                  function get_word_to_memorize_error ( err ) {
                     if (err.stack) {
                        logWrite(DBG.TAG.ERROR, 'stack:', err.stack);
                     }
                     logWrite(DBG.TAG.ERROR, 'error:', UT.inspect(err, null, 3));
                     return $(appState.error_div).html(err.toString());
                  }
               );
            };

            fsm.onEXO_HINT = function onEXO_HINT ( event, from, to, args ) {

            };
            fsm.onEXO_REP = function onEXO_REP ( event, from, to, args ) {

            };

            fsm.onNEXT = function onNEXT ( event, from, to, args ) {
               //
               logWrite(DBG.TAG.INFO, "Entered NEXT state");
               // Store the result of the word exercise
               // Ask for next word TODO: impossible, necessary link from EXO to EXIT, and NEXT to EXO
               // If no more then go to exit
               var appState = controller.appState;

               SOCK.RSVP_emit('update_word_weight_post_tsr_exo',
                                UT._extend(appState.analyzed_answer, {user_id : appState.user_id}))
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
