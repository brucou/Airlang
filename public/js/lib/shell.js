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
             UT.apply_to_props(shell.module_registry, function ( _, module_name ) {
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
                *
                * @param view_name
                * @param views : array of created views
                * @param parsed_route_view
                * @param hashFailedPromisesReasons : object containing only failed promises, with format (fulfilled: {state, value}, failed : {state, reason})
                * @param hashErrorHandlers : object with type {view_name : error_handler}. Module and shell error handler have name starting with an _
                * @returns error_handler_result
                * @returns error_handler_result.action
                * @returns error_handler_result.log
                * @returns error_handler_result.data
                * @returns error_handler_result.error_handler_stack
                */
               function execute_error_handlers ( views, view_name, parsed_route, hashFailedPromisesReasons ) {
                 // TODO : refactor to remove hashErrorhandlers now that I have views -> will be views[view_name].error_handler
                 // Helpers
                 /**
                  * Returns a hierarchical list of error handlers, starting with the view and going up the hierarchy
                  * For instance:
                  * showURL.tooltip.frame -> [showURL.tooltip.frame, showURL.tooltip, showURL, module, shell]x{error_handler, view_name}
                  * NOTE ; if one of the view do not exists, an error (undefined...) will be caused.
                  *        We then have a dependency that view children must be created after their parents,
                  *        or have to exist together with their parent
                  * @param view_name
                  * @param views : array containing all initialized views defined in the specs of the module
                  * @returns {hash} error_handler_result : returns the result of the error handler ({action, data, log, error_handler_stack})
                  */
                 function get_list_hierarchy ( view_name ) {
                   // We want showURL.tooltip -> [showURL.tooltip, showURL]
                   var list_view_names = [],
                       view_name_components = view_name.split(".");
                   view_name_components
                       .reduce(function ( prev, next ) {
                                 var view_name = prev + (prev ? "." : "") + next;
                                 list_view_names.push(view_name);
                                 return view_name;
                               }, "");
                   list_view_names.reverse();
                   return list_view_names;
                 }

                 function build_error_handler_list ( view_name, views ) {
                   // for example showURL.tooltip -> [showURL.tooltip, showURL, module, shell]_error_handler
                   // view_name has form string.string.string...

                   var list_view_names = get_list_hierarchy(view_name),
                       error_handler_list;
                   error_handler_list = list_view_names.map(function ( view_name ) {
                     return {
                       view_name     : view_name,
                       error_handler : views[view_name].error_handler
                     }
                   });
                   error_handler_list.push({view_name : '_module', error_handler : module.error_handler});
                   error_handler_list.push({view_name : '_shell', error_handler : shell.error_handler});
                   return error_handler_list;
                 }

                 var current_view = views[view_name],
                     aListHierarchy = get_list_hierarchy(view_name),
                     parsed_route_views = _.pick.apply(null, _.flatten([parsed_route, aListHierarchy], true)), // TODO : only pick the views = ancestry(view.name)
                     error_handler_list = build_error_handler_list(view_name, views),
                     error_handler_result = {},
                     error_handler_stack = [];

                 error_handler_list.some(function execute_error_handler ( hashErrorHandler ) {
                   var error_handler = hashErrorHandler.error_handler,
                       error_handler_view_name = hashErrorHandler.view_name;

                   error_handler_result = error_handler.call(current_view,
                                                             hashFailedPromisesReasons,
                                                             error_handler_stack.slice(), // shallow copy the array to disable modifying it
                                                             error_handler_view_name, views[error_handler_view_name],
                                                             parsed_route_views); // TODO : should be parsed_route for the eh_view_nam
                   // If the error_handler result is escalate, escalate to the next error handler, else return
                   // whatever action the error_handler wants to execute
                   if (UT.isErrorSettingViewStateEscalate(error_handler_result)) {
                     error_handler_stack.push({
                                                view_name                 : hashErrorHandler.view_name, // is view_name or module or shell
                                                hashFailedPromisesReasons : hashFailedPromisesReasons,
                                                error_handler_result      : error_handler_result
                                              });
                     return false
                   }
                   else {
                     return true;
                   }
                 });
                 error_handler_result.error_handler_stack = error_handler_stack;
                 return error_handler_result
               }

               /**
                * For all views, returns the promises linked to the computation of the view state properties
                * @param views
                * @param view_list
                * @param parsed_route
                * @param specs
                * @param module
                * @returns hashSetViewStatePromises {Object} : format {view_name1 : {prop1: xx}}
                */
               function computeViewsStateProperties ( /*OUT*/views, view_list, parsed_route, specs, module ) {
                 console.log("parsed route", parsed_route);
                 // For each view :
                 // - instantiate the view if it does not yet exist
                 // - set view state and hold the results of the view state handlers
                 var hashSetViewStatePromises = {}; // array containing all promises setting the view state for each view
                 view_list.forEach(function create_or_update_views ( view_name ) {
                   var current_view = views[view_name], // The ractive view object if any
                       parsed_route_view = initialize_parsed_route_view_state(view_name, parsed_route, specs, module.env);
                   log.info("Processing view : ", view_name);
                   log.info("State initialized from URL : ", parsed_route_view);

                   if (!current_view) {
                     // view does not exist yet
                     // Create and register that newly created view in registry
                     current_view = views[view_name] = instantiate_view(view_name, module, specs);
                   }
                   // TODO : check if I have to do that or not, these are two different concepts
                   // and it should already be done by the handler functions
                   UT._extend(current_view.state, parsed_route_view);
                   log.info("Updating internal state from route for view ", view_name, current_view.state);
                   // TODO : maybe remove that, it should not be needed now that I pass views in paramaters
                   hashSetViewStatePromises[view_name] =
                   computeViewStateProperties(views, view_name, parsed_route, specs, module, shell);
                 });

                 return hashSetViewStatePromises;
               }

               /**
                * Sets view state properties
                * @param view_name     : name of the view
                * @param views : array of created views. !! Children views must be created after parent
                * @param parsed_route_view : object whose properties are derived from the URL a-k-a url_state and default config
                * @param specs         : specs to transform url_state to view_state
                * @param module        :  module definition
                * @returns {Promise}: resolved or rejected promise with fields view_name, error_handler_result, hashPartialViewState
                */
               function computeViewStateProperties ( views, view_name, parsed_route, specs, module, shell ) {
                 /** Quick algorithm:
                  * parsed_route_view hash -> view_state prop hash
                  * view_state prop hash can be promises or values (which are hashed returned by the handler functions)
                  * When all is settled, I have a look at what failed and run the error handlers in consequences
                  * If the error was settled correctly, returns true, else returns false
                  */
                 function isThenable ( obj ) {return obj && obj.then && typeof obj.then === "function";}

                 function computeViewStatePropertiesPromises ( view_name, current_view, parsed_route, specs, module ) {
                   ////////
                   var parsed_route_view = parsed_route[view_name],
                       fn_computedHash,
                       computedHash,
                       hashPartialViewStateProperties = {},
                       hashPromises = {};
                   Object.keys(parsed_route_view).forEach(function ( property ) {
                     /*  For each property :
                      If property NOT IN spec
                      set view_state.property to the value passed in the url route params related to the view
                      By construction, this is an actual value, not a promise
                      This is to avoid having to use identity function (do_nop) functions in some obvious cases
                      */
                     if (!specs[view_name][property]) {
                       fn_computedHash = function ( module, current_view, parsed_route_view_state ) {
                         var hash = {};
                         hash[property] = parsed_route_view_state[property];
                         return hash;
                       }
                     }
                     else {
                       /* If property IN spec
                        execute the conversion function (grosso modo url_state -> pending_view_state)
                        */
                       fn_computedHash = specs[view_name][property].bind(current_view);
                     }

                     // If the conversion function results in an exception, then register a failed promise with the exception
                     try {
                       computedHash = fn_computedHash(module, current_view, parsed_route_view);
                       // Deal with case where conversion function do not return a hash (function just executed for side effect)
                       if (computedHash) {
                         // NEW : adding optimistic updating of state
                         if (isThenable(computedHash)) {
                           hashPromises[property] = computedHash.then(function ( hashPartialViewState ) {
                             setViewState(current_view, hashPartialViewState);
                             return hashPartialViewState
                           });
                         }
                         else {
                           hashPromises[property] = computedHash;
                           UT._extend(hashPartialViewStateProperties, computedHash);
                         }
                       }
                     }
                     catch (e) {
                       // convert the exception to a failed promise to have a common error format
                       log.debug("exception raised", e);
                       hashPromises[property] = RSVP.Promise.reject(
                           UT._extend(e, {
                             view_name : view_name, view : current_view,
                             property  : property, parsed_route_view : parsed_route_view
                           }));
                     }
                   });
                   setViewState(current_view, hashPartialViewStateProperties);
                   return hashPromises;
                 }

                 var current_view = views[view_name],
                     hashPromises = computeViewStatePropertiesPromises(view_name, current_view, parsed_route, specs, module);
                 /* Analyze the results of all the handlers. There will be :
                  values, fulfilled  promises, rejected promises (normal, and with exceptions)
                  */
                 return RSVP.hashSettled(hashPromises).then(function getComputedViewState ( hashResults ) {
                   // TODO : case where the function returns nothing (to ignore some state properties)
                   // i.e. hashPromise is value and is undefined
                   // execute error handlers on all promises which failed
                   // those error handlers returns an action field which tells us what to do
                   log.debug("Handlers url state -> view state results:", hashResults);
                   var aProperties = Object.keys(hashResults),
                       aPromisesProperties = aProperties.filter(function ( property ) {
                         // testing through duck typing
                         var keys = Object.keys(hashResults[property]);
                         return (keys.length === 2 && keys.indexOf("state") > -1);
                       }),
                       aFailedPromisesProperties = aPromisesProperties.filter(function ( property ) {
                         return hashResults[property].state === 'rejected';
                       }),
                       hashFailedPromisesReasons = {};
                   aFailedPromisesProperties.forEach(function ( property ) {
                     hashFailedPromisesReasons[property] = hashResults[property].reason;
                   });

                   // If there is some failed promise, execute the error_handlers
                   var error_handler_result =
                       (aFailedPromisesProperties.length > 0)
                           ? execute_error_handlers(views, view_name, parsed_route, hashFailedPromisesReasons)
                           : undefined;

                   // Return a rejected promise to indicate that 'setting view state for all views' failed
                   // That means if we cannot implement the route URL fully, we return failure
                   // Otherwise return a resolved promise if everything went fine
                   // We returns the view name whose state we want to set, the partial state that was constructed
                   // and the result of executing the error handler if it applies.
                   var hashPartialViewState = undefined;
                   if (!error_handler_result) {
                     // if (!UT.isErrorSettingViewState(error_handler_result)) {
                     // Set view state properties
                     // 1. view state properties to be modified are identified. The list of properties is :
                     //    - all properties in aProperties, which corresponding to a value, or a resolved promise...
                     hashPartialViewState = aProperties
                         .reduce(function ( hashPartialViewState, prop_next ) {
                                   var result = hashResults[prop_next];
                                   result.state === 'fulfilled' &&
                                   UT._extend(hashPartialViewState, result.value);
                                   return hashPartialViewState;
                                 }, {});
                     log.debug("hashPartialViewState", hashPartialViewState);
                   }
                   if (!UT.isErrorSettingViewState(error_handler_result)) {
                     // 2. ... AND the hash returned by error_handler
                     // NO: it can be another view that is being extended
                     // error_handler_result && UT._extend(hashPartialViewState, error_handler_result.data);
                     return RSVP.Promise.resolve({ view_name            : view_name,
                                                   error_handler_result : error_handler_result,
                                                   hashPartialViewState : hashPartialViewState});
                   }
                   else {
                     return RSVP.Promise.reject({ view_name            : view_name,
                                                  error_handler_result : error_handler_result,
                                                  hashPartialViewState : hashPartialViewState});
                   }
                 });
               }

               function setViewState ( current_view, new_view_state ) {
                 // !! depends also on current_view, as this is an internal function, I leave it like this
                 log.info("Updating view state for View " + current_view.name + " : ", new_view_state);
                 current_view.set(new_view_state);
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
               function initialize_parsed_route_view_state ( view_name, parsed_route, specs, env ) {
                 // Completes the state objects with default properties if they are not specified
                 function complete_state_obj_w_defaults ( instance_data, specs, env, view ) {
                   return _.extendOwn({},
                                      specs[view]._default_state,
                                      instance_data,
                                      env);
                 }

                 var parsed_route_view = parsed_route[view_name] || {};
                 // Deal with the edge case /module/[nothing here], where instance_data is empty
                 // parsed_route_view.state = parsed_route_view.state || {};

                 // If there are properties missing in instance_data.state fill them in with default values
                 parsed_route_view = complete_state_obj_w_defaults(parsed_route_view, specs, env, view_name);
                 return parsed_route_view;
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

               function instantiate_view ( view_name, module, specs ) {
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
                 current_view.name = view_name;
                 current_view._view_list = UT.fn_get_public_props(specs, '_');
                 return current_view;
               }

               /////
               !module.initialized && initialize_module(module, router);

               var specs = module.specs,
                   views = module.views = module.views || {},
                   parsed_route = aStrRoute.length !== 0 ? JSON.parse(aStrRoute) : {},
                   view_list = initialize_view_list(parsed_route, specs),
                   hashSetViewStatePromises;

               // TODO : add an array with the parsed params for each view, so I can pass it around in error handlers
               log.debug("unparsed route : ", aStrRoute);

               // Destroy first the views which are not in the route
               destroy_outdated_views(view_list, views);
               // Compute all view state properties from:
               // - the information in the URL (parsed_route)
               // - the specs which contain the handlers
               hashSetViewStatePromises =
               computeViewsStateProperties(/*OUT*/views, view_list, parsed_route, specs, module);
               // Reminder : hashViewsStatePromises resolves as follows :
               // {view_name: {error_handler_result: xx, hashPartialViewState: xx, view_name: xx}}
               // whether error or not

               // We have executed all the handlers to display the views. Now we handle the results of such handlers
               // Reminder : hashSetViewStatePromises :: view_name, error_handler_result, hashPartialViewState
               // TODO : if one promise is rejected, then immediately exit
               RSVP.hash(hashSetViewStatePromises)
                   .then(function setViewsStates ( hashViewsStateProperties ) {
                           // Two cases:
                           // 1. No error encountered, and view state have been optimistically set already
                           // 2. Some error was encountered but was satifactory solved
                           //    in the data property, we find a hash {view_name: {prop1: value}}
                           var view_list = Object.keys(hashViewsStateProperties);
                           view_list.forEach(function ( view_name ) {
                             // NOTE : by construction,  error_handler_result and hashPartialViewState are exclusive
                             var error_handler_result = hashViewsStateProperties[view_name].error_handler_result;
                             var hashPartialViewState = hashViewsStateProperties[view_name].hashPartialViewState;
                             // NOTE : check that hashViewStateProperties[view_name] === view_name
                             var current_view = views[view_name];
                             if (!error_handler_result) {
                               // Case : no error encountered
                               // if (!UT.isErrorSettingViewState(error_handler_result)) {
                               // TODO : if error_handler_result has some error dealth with i.e. there is a stack
                               // In principle already done by the handlers which executed correctly
                               // setViewState(current_view, hashPartialViewState);
                             }
                             else {
                               // case when there is an error handler which resolves the error satisfactorily
                               // NOTE: The error handler resolves all errors in one go for a particular view
                               // properties to be set are in data with format data : {view_name : {property: xx}}
                               var view_list = Object.keys(error_handler_result.data);
                               view_list.forEach(function setViewsStatePropFromCorrectedError ( view_name ) {
                                 setViewState(views[view_name], error_handler_result.data[view_name]);
                               });
                             }
                             // Deal with case of nested view i.e. viewX.viewY.viewZ.view
                             // We register a reference for that view in the parent for easy retrieval
                             store_child_view_in_parent(views, view_name, current_view);
                           })
                         },
                         function error_handler_set_views_states ( rejected_promise_value ) {
                           /**
                            * {showURL : {prop1: value1}, showURL.toolip : {prop1: value1}} --> [{action: , state: }, {}]
                            * @param stateHash
                            * @returns {{}}
                            */
                           function fromStateHashToRouteHash (stateHash) {
                             return Object.keys(stateHash).map(function(key){ // The view, i.e. showURL
                               return {action : key, state : stateHash[key]};
                             });
                           }
                           // TODO
                           // One of the views could not be displayed as its state cannot be set
                           // but which one? We need to know to get the action to perform...
                           var view_name = rejected_promise_value.view_name;
                           var error_handler_result = rejected_promise_value.error_handler_result;
                           if (UT.isErrorSettingViewState(error_handler_result)) {
                             // This view is the one returning error
                             // But wait, what if we have several such views?? Impossible, as by definition of hash
                             // the first promise to fail will exit the chain, so we have only one
                             // Also, by construction, this is a true error (result of error handler cannot be OK)
                             switch (error_handler_result.action) {
                               // TODO : continue with the set other state etc. and perform the code here not in computeViewState
                               // TODO : change the exising error handler in the readerviews
                               // attention : reason can be an instance of exception (case fn_handler throwing exception
                               //             reason can be a promise rejected, in which case the reason format will vary)
                               case UT.config.error.action.PREV_STATE:
                                 // go to the previous state
                                 // TODO
                                 return true;
                               case UT.config.error.action.CHANGE_STATE:
                                 // go to a given state, described in property 'data'
                                 // TODO
                                 console.log("UT.config.error.action.CHANGE_STATE");
                                 views[view_name].go (fromStateHashToRouteHash (error_handler_result.data.new_state));
                                 return true;
                                 break;
                               case UT.config.error.action.THROW_ERR:
                                 // err described in property 'data'
                                 // TODO
                                 return true;
                                 break;
                               default:
                                 throw "unknown action code found when executing error_handler list";
                                 break;
                             }
                           }
                         })
                   .catch(RSVP.rethrow); // rethrows any uncaught exceptions raised in the execution of the promise
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
             PubSub.subscribe(UT.config.ERROR_CHANNEL, function pubsub_err_handler ( channel, message ) {
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
             PubSub.publish.call(PubSub, UT.config.ERROR_CHANNEL, args.join(" | "));
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
