/**
 * Created by bcouriol on 22/11/14.
 * Spec and algorithm in TSR.md
 */

define(['jquery', 'state-machine', 'socket', 'utils'], function ( $, STM, SOCK, UT ) {
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
//   TSR.EXO_HINT_view = can.view('tpl-tsr-tool-EXO-HINT');
//   TSR.EXO_REP_view = can.view('tpl-tsr-tool-EXO-REP');

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

            // Show the view
            $el.html(TSR.EXO_view());
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
            this.EXO_controller = this.EXO_HINT_controller = this.EXO_REP_controller = undefined;

            // Show the view
            $el.html(TSR.mainView(this.mainViewAdapter));

            //Create and start the state machine
            this.fsm = this.createStateMachine();
            this.fsm.start();

            // TODO :
         },

         createStateMachine : function createStateMachine () {
            var controller = this;
            var fsm = STM.create({
                                    initial   : 'INIT',
                                    events    : [
                                       { name : 'start', from : 'INIT', to : 'EXO' },
                                       { name : 'ok', from : 'EXO, EXO_HINT', to : 'NEXT' },
                                       { name : 'nok', from : 'EXO', to : 'EXO_HINT' },
                                       { name : 'nok', from : 'EXO_HINT', to : 'EXO_REP' },
                                       { name : 'end', from : 'NEXT', to : 'EXIT'  }
                                    ],
                                    error     : function ( eventName, from, to, args, errorCode, errorMessage,
                                                           exception ) {
                                       // TODO : detect the abort event
                                       if (eventName === 'abort') {
                                          abort();
                                          // execute abort handler
                                       }
                                       else {
                                          logWrite(DBG.TAG.ERROR, "error occurred while operating state machine",
                                                   'event ' + eventName + ' : ' + (exception || errorMessage));
                                          //TODO: and then what? fail silently? or close the window and pass an error up?
                                       }
                                    },
                                    callbacks : {
                                       onINIT : function onINIT ( event, from, to, args ) {
                                          console.log("Machine initialized");
                                          // So far unused. This is here because it is called at creation time
                                       }
                                    }
                                 });

            // callback handling state transitions
            fsm.onEXO = function onEXO ( event, from, to, args ) {
               //HELPER FUNCTION
               function filter_prop_EXO ( appState ) {
                  return UT.filter_out_prop(appState, ['jQuery', 'Element']);
               }

               // Get the schedules
               logWrite(DBG.TAG.INFO, "Entered EXO state");
               //TODO : get next word remotely asking
               var appState = controller.appState;
               var socket = controller.appState.socket;
               // !!!!! Cannot emit object with too many properties
               // as socket.io does a recursive search for binary prop which
               // exceeds stack size (and take time)
               // So for example no jQuery element
               socket.RSVP_emit('get_word_to_memorize', filter_prop_EXO(appState))
                  .then(
                  function get_word_to_memorize_success ( result ) {
                     logWrite(DBG.TAG.DEBUG, 'result', UT.inspect(result, null, 3));
                     controller.mainViewAdapter.set_current_word(
                        result.toString(),
                        "TOBEDONE");
                     controller.EXO_controller = new TSR.EXO_controller('#tsr-exercise-container',
                                                                        {appState: appState});

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

            };
            fsm.onEXIT = function onEXIT ( event, from, to, args ) {

            };
            return fsm;
         },

         eventHandler1 : null,
         eventHandler2 : null
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
