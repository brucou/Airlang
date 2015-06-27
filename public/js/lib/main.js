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
    'shell',
    'readerModule',
    'TSRController',
    'url_load'
   ],
   function ( DBG, $, SHELL, RDT, TSR, UL ) {
      // logger
      var log = DBG.getLogger("main");
      init_log();

      // TEST
      $(function () {
        // Register modules

        SHELL.register_module(RDT);
         /*
          Defining and configuring the application level router and routes
          */
         var routerConfig = {
            param                : {
               'all' : /(.*)/
            },
            routes               : {
               // NOTE  :xxx only matches one word. When an $ is encountered, that's the end of the matching
               // NOTE : matching is exact, i.e. if there is anything after, there is no match
               '/' : function () {
                  log.info("home page: nothing there yet for now", arguments)
               }
            },
            routeLogger          : function routeLogger () {
               log.info("changing route to " + window.location);
            },
            routeNotFoundHandler : function routeNotFoundHandler () {
               log.error("routeNotFoundHandler", this);
               log.error("routeNotFoundHandler", arguments);
            },
            routeResource        : {
               // this contains function which are referred by their string name in the router object
            },
            configure            : {
               notfound     : this.routeNotFoundHandler,
               before       : this.routeLogger,
               resource     : this.routeResource,
               html5history : false
            },
            startupRoute         : '/rdt/something&else=3'
         };
         var router = SHELL.configure_router(routerConfig);


         // Initialize socket connection and feature modules
         localStorage.clear();

         // TEST CODE
         init_fake();
         ////////////
         // Start Qunit if called from test index.html starting page
         if ('undefined' !== typeof QUnit) {
            log.info("Starting QUnit tests");
            QUnit.start();
         }
         ////////////

         // Start the app
         SHELL.init();
         SHELL.start_app(router, RDT.name);

         // TODO : implement it with the router and module mechanism
         // TSR button handler
         // no controller, just a click handler
         $("#TSR").click(function ( event ) {
            TSR.init();
            //TODO: think about what data to pass the controller
            // appState is certainly one of them, maybe not views and adapters
            // put the model in another file
            new TSR.mainController("#TSR_div", {appState : SHELL.env}); //TODO : appState with user_id
         });
      });

      function start () {

         //TODO Change user_id in new RC... to appState, or pass a clone of the object
         new RC.ReaderToolController("#reader_tool",
                                     {  user_id         : 1,
                                        first_language  : appState.first_language,
                                        target_language : appState.target_language,
                                        // TODO : to put in config of RM or view??
                                        translate_by    : 'click'});
      }

      function init_log () {
         DBG.init({FORCE_TRACE : false});
         DBG.setConfig(DBG.TAG.DEBUG, true, {by_default : true})
         (DBG.TAG.TRACE, true, {by_default : true})
         (DBG.TAG.INFO, true, {by_default : true});
         DBG.disableLog
         (DBG.TAG.DEBUG, "putValueInCache")
         (DBG.TAG.DEBUG, "disaggregate_input")
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

   });
// */
