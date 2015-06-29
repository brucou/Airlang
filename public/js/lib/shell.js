/**
 * Created by bcouriol on 23/06/15.
 */
define(['debug',
        'pubsub',
        'router',
        'rsvp',
        'socket',
        'stateful',
        'utils'],
       function ( DBG, PubSub, Router, RSVP, SOCK, STATE, UT ) {
         // logger
         var log = DBG.getLogger("shell");

         /* Shell algorithm
          1. Initialize the router
          2. Determine the module from the route
          3. Get specs of the module
          4. Initialize the module -> Constructors of needed objects
          5. Start the controller with the route passed on

          .                                                  DOM/channel events
          .                                                          |
          INITIALIZE_ROUTER  --->  router  -------------         module_events<-
          |                                            |             |         |
          |-->(onHashChange)                           |         (HANDLERS)  <----->  model, state
          |       |   PARSE                        CONTROLLER        |
          |     route ----> module ----> specs   ------------>   module_state ------> view_state
          |       |                |INIT               ^             |_________________________________
          |       |                |---> constructors --             ^                                 |
          |       |                                    |             |                                 |
          |       |------------------------------------|           model                               |
          |                                                                                            |
          ---------------------------<---------------------------------<-------------------------------|
          */
         // the shell :
         // 1. Keeps a list of module that is manages (registry mechanism)
         // 2. loads module
         // 3. TODO : the shell should read a file or something in localstorage, to configure loaded module
         // 4. TODO : add a login mechanism to have different user ids

         var shell = {
           module_registry       : {},
           get_module_names      : function () {
             // TODO : go through all own props in module_registry and return the name property
             var aModuleNames = [];
             UT.apply_to_props(shell.module_registry, function (_, module_name) {
               aModuleNames.push(module_name);
             });
             log.debug("module names :", aModuleNames);
             return aModuleNames;
           },
           register_module       : function register_module ( module ) {
             var module_registry = this.module_registry;
             if (module && module.name) {
               module_registry[module.name] = module;
               log.info("Registered module ", module.name);
             }
             else {
               throw ("register_module: incorrect argument module : must be truthy and with a name: " + module);
             }
           },
           get_module_definition : function ( module_name ) {
             var module_registry = this.module_registry;
             log.debug("getting definition of module ", module_name, module_registry[module_name]);
             return (!module_registry[module_name])
               ? PubSub.err('SHELL', 'could not find module ' + module_name) && undefined
               : module_registry[module_name]
           },
           get_controller        : function get_controller ( module_definition ) {
             var module = { //TODO : that is basically a shallow copy of module_definition and extension
               init         : module_definition.init,
               specs        : module_definition.specs,
               name         : module_definition.name,
               model        : module_definition.model,
               components   : module_definition.components,
               views        : undefined, // initialized later with the views to display
               initialized  : false, // whether or not the controller has been initialized,
               env          : shell.env,
               router       : undefined, // will be used in specs and views to change dinamically the route
               constructors : undefined // will hold the constructors for views and components
             };

             return function controller ( router, aStrRoute ) {
               // Helper functions
               /**
                * Sets view state properties
                * @param view_name     : name of the view
                * @param current_view  : view object
                * @param instance_data : object whose properties are derived from the URL a-k-a url_state and default config
                * @param specs         : specs to transform url_state to view_state
                * @param module        : reference to module definition
                */
               function setViewStateProperties ( view_name, current_view, instance_data, specs, module ) {
                 // Helpers
                 function setViewState ( new_view_state ) {
                   // !! depends also on current_view, as this is an internal function, I leave it like this
                   log.info("Updating view state for View " + current_view.name + " : ", new_view_state);
                   current_view.set(new_view_state);
                 }

                 ////////
                 var new_view_state = {};
                 /*  For each property :
                  If property NOT IN spec
                  set view_state.property to the value passed in instance_data
                  By construction, this is an actual value, not a promise
                  If property IN spec
                  execute the conversion function (grosso modo url_state -> view_state)
                  If result IS a PROMISE
                  If promise resolves
                  set view_state.property to the value resolved
                  Else handle error
                  If result IS NOT a PROMISE
                  set view_state.property to result
                  Note : In practice, all actual results (i.e. not promises) are accumulated in one object
                  to allow for one-time update of view state instead of piecewise. Reason : efficiency
                  */
                 Object.keys(instance_data.state).forEach(function ( property ) {
                   current_view.state = instance_data.state;
                   if (!specs[view_name][property]) {
                     log.info("Updating view state from url property " + property +
                              " : not in view specs, so copy it to view state");
                     new_view_state[property] = instance_data.state[property];
                   }
                   else {
                     var computedHash = specs[view_name][property].bind(current_view)(module, current_view, instance_data.state)
                       || {}; // case where the function returns nothing (to ignore some state properties)
                     if (UT.isPromise(computedHash)) {
                       log.info("Updating view state from url property " + property +
                                ": is a promise so waiting for it to resolve before updating state");
                       computedHash.then(setViewState,
                                         function error_handler ( error ) {
                                           current_view.error_handler.call(current_view, current_view, error);
                                         });
                     }
                     else {
                       log.info("Updating view state from url property " + property +
                                " : in view specs, with value :", computedHash);
                       Object.keys(computedHash).forEach(function ( computed_property ) {
                         new_view_state[computed_property] = computedHash[computed_property];
                       });
                     }
                   }
                 });
                 setViewState(new_view_state);
               }

               /**
                * Remove views that were previously created but are no longer in the route, i.e. not to be displayed
                * @param {String[]} view_list : target name list of views (i.e. view to display)
                * @param views : hash of existing view objects i.e. {view_name1: obj, view_name2:obj}
                */
               function destroy_outdated_views ( view_list, views ) {
                 UT.apply_to_props(views, function ( views, view ) {
                   if (view_list.indexOf(view) == -1) {
                     log.info("views : destroying existing view " + views[view].name +
                              " which is not in the route");
                     views[view].dispose();  // Clear the Rx listeners
                     views[view].teardown(); // Clear the view
                     delete views[view];
                   }
                 });
               }

               function initialize_module ( module, router ) {
                 log.info("Initializing controller");
                 log.debug("module", module);
                 module.router = router;
                 module.init(module);
                 module.initialized = true;
                 module.constructors = module.components;
               }

               function initialize_view_list ( parsed_route, specs ) {
                 log.debug("Route : ", parsed_route);
                 var view_list = {};
                 if ($.isEmptyObject(parsed_route)) {
                   log.info("route has no view, initializing to default : ", specs.default.view);
                   view_list = [specs.default.view];
                 }
                 else {// List of names of views to instantiate
                   view_list = Object.keys(parsed_route);
                   log.info("views to update : ", view_list);
                 }
                 // remove _xxx properties
                 view_list = view_list.filter(function ( key ) {
                   return key[0] !== '_';
                 });

                 return view_list;
               }

               /* Initialize view state object with the properties passed in the URL
                NOTE : URL :: {"showUrl":{"state":{"url":"http://xxx","webpage_readable":"","is_tooltip_displayed":false}}} */
               function initialize_view_state ( view_name, parsed_route, specs, env ) {
                 // Completes the state objects with default properties if they are not specified
                 function complete_state_obj_w_defaults ( /*OUT*/instance_data, specs, env, view ) {
                   var temp = {};
                   UT._extend(temp, specs[view]._default_state);
                   UT._extend(temp, instance_data.state);
                   UT._extend(temp, env);
                   instance_data.state = temp;
                 }

                 var instance_data = parsed_route[view_name] || {};
                 // Deal with the edge case /module/[nothing here], where instance_data is empty
                 instance_data.state = instance_data.state || {};

                 // If there are properties missing in instance_data.state fill them in with default values
                 complete_state_obj_w_defaults(instance_data, specs, env, view_name);
                 return instance_data;
               }

               // for instance child = showUrl.tooltip -> parent = showUrl -> views.showUrl.state.tooltip = the tooltip
               function store_child_view_in_parent ( views, view_path, current_view ) {
                 var path_split = UT.split_xpath(view_path, '.');
                 var child_view_path = path_split.dirname;
                 var child_view_name = path_split.filename;
                 if (child_view_path.length > 0) {
                   log.info("Processing view : child view : set props in parent : ", child_view_path);
                   UT.traverse_dir_xpath(views, child_view_path)
                     .state[child_view_name] = current_view;
                 }
               }

               /////
               !module.initialized && initialize_module(module, router);

               var specs = module.specs;
               var views = module.views = module.views || {};
               var parsed_route = aStrRoute.length !== 0 ? JSON.parse(aStrRoute) : {};
               log.debug("unparsed route : ", aStrRoute);
               var view_list = initialize_view_list(parsed_route, specs);

               // Destroy first the views which are not in the route
               destroy_outdated_views(view_list, views);

               // For each view :
               // - instantiate the view if it does not yet exist
               // - set view state
               //   + from parsed_route, view.specs, module.env
               view_list.forEach(function create_or_update_views ( view_name ) {
                 var current_view = views[view_name]; // The ractive view object if any
                 log.info("Processing view : ", view_name, current_view);
                 var instance_data = initialize_view_state(view_name, parsed_route, specs, module.env);
                 log.info("State initialized from URL : ", instance_data.state);

                 if (current_view) {
                   // view already exists, update state ...
                   log.info("View already exists : we update state");
                   UT._extend(current_view.state, instance_data.state);
                   // ... and view_state
                   setViewStateProperties(view_name, current_view, instance_data, specs, module);
                 }
                 else {
                   // view does not exist yet
                   log.info("View does not exist - creating view : " + view_name);
                   // create the view. The constructor is under specs with the view name (no path '.')
                   // the view instance itself is however stored under the full name (with path '.')
                   var view_constructor = module.constructors[specs[view_name]._create.constructor];
                   // extend with _pubsub and _listeners and _channels...
                   var extra_params = ['pubsub', 'listeners', 'channel'];
                   var extra_obj = {};
                   extra_params.forEach(function ( property ) {
                     var _property = specs[view_name]['_' + property];
                     _property && (extra_obj[property] = _property);

                   });
                   current_view = new view_constructor(UT._extend(specs[view_name]._create.params, extra_obj));
                   //... and router, and module, and view_list
                   current_view.router = router;
                   current_view.module = module;
                   current_view._view_list = UT.fn_get_public_props(specs, '_');
                   // Register that newly created view in registry
                   views[view_name] = current_view;
                   log.debug("views : ", views);
                   setViewStateProperties(view_name, current_view, instance_data, specs, module);
                   // Deal with case of nested view i.e. viewX.viewY.viewZ.view
                   // We register a reference for that view in the parent for easy retrieval
                   store_child_view_in_parent(views, view_name, current_view);
                 }
               });
             }
           },
           configure_router      : function configure_shell_level_router ( myRouter ) {

             // Get router object
             router = Router();
             // apply configuration options
             router.configure(myRouter.configure);
             // Apply alias for regexp
             UT.apply_to_props(myRouter.param, function ( obj, key ) {
               router.param(key, obj[key]);
             });
             // Define route handlers /module_name/* for each module registered in shell
             shell.get_module_names().forEach(function ( module_name ) {
               router.on(["", module_name, ":all"].join("/"),
                         shell.get_controller(shell.get_module_definition(module_name)).bind(shell, router));
             });
             // Assign also the extra routes in addition to the modules routes
             Object.keys(myRouter.routes).forEach(function ( route ) {
               router.on(route, (function () {
                 //TODO
               }));
             });
             PubSub.subscribe(UT.ERROR_CHANNEL, function pubsub_err_handler ( channel, message ) {
               log.error(message)
             });

             log.debug("router configured");
             return router;
           },
           start_app             : function ( router, module ) {
             // Start the router
             router.init();
             //router.setRoute('/' + module + '/');
             log.info("app started");
           },
           set_env               : function ( hashObj ) {
             Object.keys(hashObj).forEach(function ( prop ) {
               shell.env[prop] = hashObj[prop];
             });
           },
           env                   : {
             // any variable which must be visible to any module
           },
           init                  : function () {
             // loads config values and env values
           }
         };

         shell.init = function () {
           // configure error handler to avoid silent failure or RSVP promises
           RSVP.on('error', function ( reason ) {
             log.error(reason);
             throw reason;
           });

           // configure PubSub exception handler to avoid silent failures
           PubSub.immediateExceptions = true;
           // Assign handler for errors communicated through PubSub
           PubSub.err = function () {
             var args = Array.prototype.slice.call(arguments);
             PubSub.publish.call(PubSub, UT.ERROR_CHANNEL, args.join(" | "));
           };

           // Initialize socket connection
           SOCK.init();
           STATE.init();

           // Configuration of data synchronization library
           if (typeof Orbit !== 'undefined') {
             Orbit.Promise = RSVP.Promise;
             Orbit.ajax = $.ajax;
           }

           // Set environment variables which will be passed to every module
           shell.set_env({
                           user_id         : 1, // supposedly set after authentification phase
                           // NOTE : ISO 639-2 codes are used for encoding language information
                           first_language  : 'eng',
                           target_language : 'cze'
                         });
         };

         return shell;
       });
