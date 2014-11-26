/**
 * Created by bcouriol on 22/11/14.
 * Spec and algorithm in TSR.md
 */

define(['jquery', 'state-machine'], function ( $, STM ) {
   // define config object with its defect values
   var cfg = {};
   var TSR = {};

   TSR.config = function config ( cfg ) {
      // copy all own props of cfg into private var cfg
   };

   // Views and corresponding view adapters
   // View adapter contain the {{parameters}} used in view templates and their setters
   TSR.mainView = can.view('tpl-tsr-tool-main');

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
            logWrite(DBG.TAG.INFO, "initializing TSR Controller with options", UT.inspect(options));
            var controller = this;
            this.appState = this.options.appState;

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
                                    initial  : 'INIT',
                                    events   : [
                                       { name : 'start', from : 'INIT', to : 'EXO' },
                                       { name : 'ok', from : 'EXO, EXO_HINT', to : 'NEXT' },
                                       { name : 'nok', from : 'EXO', to : 'EXO_HINT' },
                                       { name : 'nok', from : 'EXO_HINT', to : 'EXO_REP' },
                                       { name : 'end', from : 'NEXT', to : 'EXIT'  }
                                    ],
                                    error    : function ( eventName, from, to, args, errorCode, errorMessage ) {
                                       // TODO : detect the abort event
                                       if (eventName === 'abort') {
                                          abort();
                                          // execute abort handler
                                       }
                                       else {
                                          logWrite(DBG.TAG.ERROR, "error occurred while operating state machine",
                                                   'event ' + eventName + ' was naughty :- ' + errorMessage);
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
               // Get the schedules
               console.log("Entered EXO state");
               controller.mainViewAdapter.set_current_word("Exemple", "Adjective");
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
      });

   function abort () {
      // TODO : used if the user close the window while in the middle of a TSR session
   }

   TSR.init = function init() {

   };

   return TSR;
});
