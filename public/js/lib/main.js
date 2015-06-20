/*
 Convention : ALL_CAPS : constants
 sCamelHumps : variables
 function_name : functions
 ObjectConstructor : object
 */

/**
 * TODO: MODULARITY
 * - investigate how to have module both require.js and stand alone in same file
 * - register function with the language they are associated to ('cs' etc.)
 * - use router : https://github.com/flatiron/director (works server and client side, no dependencies of Jquery and the rest
 * TODO: DOCUMENTATION
 * - documentation in code, refactoring, and split in file
 * TODO: DEBUGGING
 * - fake all the server communication server - that should allow to run with debugging in webstorm
 * TODO: TESTING
 * - testing suite to write
 * - installe SINON pour les FAKES en conjonction avec QUNIT
 * TODO: CONFIGURATION
 * - move all configuration constant to a single file or object, namespace by the module who uses it
 * TODO: DEPLOYMENT
 * -  CLOUD : when ready to switch to english dictionary, move it to cloud
 * TODO : FEATURES
 * - do the structure to add recognizing of language, and get back the language info, passed as param to server calls
 * - full API for the reader tool
 * - - language API : recognize language, similar words, translation API etc.
 * - -                all configurable to use different sources - word reference, wordnet etc.
 * - - memrise API : to define
 * - - user state object :
 * - - - will be necessary for the memrise API
 * - - - will be necessary to store server side, explicit the API (socket-based, no REST)
 * - - - log modification through operation, will help to have an UNDO capability
 * - - have a model for design templating for the views of each tool
 */

/**
 * how to have code work in node, require and browser
 * (function(global, factory) {
    if (typeof exports === 'object') {
        // Node
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals
        global.printStackTrace = factory();
    }
}(this, function() {}))
 */
/*
 Configuring require.js
 */
/**
 requirejs.config(
 {
    //By default load any module IDs from js/lib
    baseUrl: './js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths  : {
       jquery  : '../vendor/jquery-1.10.2.min',
       cache   : '../vendor/cache',
       mustache: '../vendor/mustache',
       css     : '../../css',
       assets  : '../../assets',
       socketio: '/socket.io/socket.io'
    }
 });
 */
/*
 Require : load the indicated dependencies if needed, and run the function inside
 Define : does not run anything. It defines (declarative) the module.
 When a module is looked for, the factory function passed as a parameter is executed
 to return the object)
 So we start the app here.
 */

///*
requirejs(
   ['debug',
    'jquery',
    'ReaderModel',
    'ReaderController',
    'socket',
    'Stateful',
    'TSRController',
    'url_load', 'rsvp'
   ],
   function ( DBG, $, RM, RC, SOCK, STATE, TSR, UL, RSVP ) {
      // logger
      var log = DBG.getLogger("main");

      var appState = {};

      function start () {
         // TODO : add a login mechanism to have different user ids
         // TODO : do my own controller using uberproto for prototypal inheritance : http://daffl.github.io/uberproto/
         appState = {
            type            : 'appState',
            error_div       : '#application_error',
            user_id         : 1,
            // NOTE : ISO 639-2 codes are used for encoding language information
            first_language  : 'eng',
            target_language : 'cze'
         };

         //TODO Change user_id in new RC... to appState, or pass a clone of the object
         new RC.ReaderToolController("#reader_tool",
                                     {  user_id         : 1,
                                        first_language  : appState.first_language,
                                        target_language : appState.target_language,
                                        translate_by    : 'click'});
         // TSR button handler
         // no controller, just a click handler
         $("#TSR").click(function ( event ) {
            TSR.init();
            //TODO: think about what data to pass the controller
            // appState is certainly one of them, maybe not views and adapters
            // put the model in another file
            new TSR.mainController("#TSR_div", {appState : appState}); //TODO : appState with user_id
         });
      }

      function init_log () {
         DBG.init({FORCE_TRACE : false});
         DBG.setConfig(DBG.TAG.DEBUG, true, {by_default : true})
         (DBG.TAG.TRACE, true, {by_default : true})
         (DBG.TAG.INFO, true, {by_default : true});
         DBG.disableLog
         (DBG.TAG.DEBUG, "putValueInCache")
         (DBG.TAG.DEBUG, "disaggregate_input")
         (DBG.TAG.DEBUG, "async_cached_f")
         (DBG.TAG.TRACE, "async_cached_f")
         (DBG.TAG.TRACE, "propagateResult")
         (DBG.TAG.TRACE, "async cached callback")
         (DBG.TAG.DEBUG, "highlight_text_in_div")
         (DBG.TAG.DEBUG, "search_for_text_to_highlight")
         (DBG.TAG.TRACE, "search_for_text_to_highlight")
         (DBG.TAG.TRACE, "get_text_stats")
         (DBG.TAG.TRACE, "generateTagAnalysisData")
         (DBG.TAG.TRACE, "get_DOM_select_format_from_class")
         (DBG.TAG.TRACE, "getHitWord")
            //(DBG.TAG.DEBUG, "getHitWord")
         (DBG.TAG.TRACE, "is_comment_start_token")
         (DBG.TAG.TRACE, "is_comment_end_token")
            //(DBG.TAG.TRACE, "dataAdapterOStore2TokenActionMap")
            //(DBG.TAG.DEBUG, "dataAdapterOStore2TokenActionMap")
         (DBG.TAG.TRACE, "default_identity_filter")
         (DBG.TAG.TRACE, "fn_html_highlight")
         (DBG.TAG.TRACE, "parseDOMtree")
         (DBG.TAG.DEBUG, "apply_highlighting_filters_to_text")
         (DBG.TAG.TRACE, "simple_tokenizer");
      }

      function init_fake () {
         FAKE.replace(UL, 'UL.url_load', FAKE.fn.url_load);
         //FAKE.replace(RM, 'RM.get_stored_notes', FAKE.fn.get_stored_notes);
         //RM.set_notes([]);
      }

      $(function () {
         init_log();
         // TEST CODE
         //trace.config('ReaderToolController', 'Constructor', false);
         //trace(RM, 'RM');
         //trace(RC, 'RC');
         //trace(IO, 'IO');
         init_fake();
         ////////////
         // configure error handler to avoid silent failure or RSVP promises
         RSVP.on('error', function ( reason ) {
            log.error(reason);
         });
         // Initialize socket connection and feature modules
         $.when(
            SOCK.init(),
            STATE.init(),
            RM.init()
         ).then(
            function () {
               localStorage.clear();
               // Start Qunit if called from test index.html starting page
               if ('undefined' !== typeof QUnit) {
                  log.info("Starting QUnit tests");
                  QUnit.start();
               }

               // Start the app
               start();
            });
      });
   });
// */
