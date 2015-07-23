/**
 * Created by bcouriol on 24/06/15.
 */
/*
 The shell app controls the application modules. Modules are a cohesive set of application functionalities, which is
 implemented through a user interface (views and actions which results in a series of side-effects : state and model changes).
 Views can be hierarchical (children views, parent views) reflecting the subordination of one view to another. Actions
 can be user-generated or application-generated. Views communicate through channels.

 Modules encode those functionalities by means of a datastructure consisting of two objects:
 - init
 - specs

 Init
 The role of the Init object is to return the Constructors for the views that will be used to display the user interface.
 Those constructors are properties of the object returned by Init and will be referenced in the Specs section
 of the module.
 In the constructors can figure all properties which are the same for every constructed view object
 (i.e. prototypal properties), such as behavioural properties (events, listeners, channel), state properties (state),
 inmutable properties (props), identification properties (name), etc.
 Properties which are specific to run-time are better set at run-time, possibly overloading existing properties. Among
 those : DOM element, run-time configuration, specific listeners, etc.

 Specs
 The role of the Specs object is to specify the behaviour of the user interface when routing.
 Responses to user actions are generally specified in the constructor objects (they usually do not belong to run-time
 as they are the same for any views).
 The specs part of the module describes : relationship between route and state, initialization of the view(s).
 The specs object has the following form:
 specs : {
 'default' :
 view1 :
 view2.view1 :
 ... :
 }

 'default' property:
 This object holds (in its view property) the name of the view that will be instantiated if none is specified in the route.
 That view must exist as a property in the specs object.
 Example : 'default' : {view : 'showUrl'} ; specs : {'default' : xx, 'showUrl' : xx}

 'view' (no '.') property:
 View properties are of two types:
 1. Private properties
 _create :
 _constructor : The name of the constructor for the view to instantiate
 params : the parameters to call the constructor with
 _default_state :
 Any properties present in the default_state object and not present in the route state object will be added to the
 state object. The default_state object in particular should hold the full list of properties that are used to recall
 a particular state from routes. It serves then also as documentation of the different possible state fields.

 2. Public state properties
 The goal of this object is to turn the state passed through in the route into a view state itself leading to a specific
 set of views in a specific state in the user interface.
 The route is decoded, _default_state is used to fill in missing fields, resulting in a state object with a serie of
 properties. Those properties are matched against the properties in specs.view. Two situations may occur:
 - no such property is in specs.view.
 In that case, the view state for that property is set to the same value as in the route state object. This is to avoid
 trivial matching such as prop1: function (...) { return {prop1:prop1}}
 - there is a such property in specs.view
 In that case, it MUST be a function. That function is executed and results in a set of properties which will be go to
 update the view state. If that function returns a promise, the view state is set immediately upon resolving the promise.
 Otherwise, changes to the view_state are accumulated in one object and executed in one swoop. This avoids refreshing
 the DOM for each object.
 NOTE : it is discutable whether a better option is to have ONE function to turn route state to view state
 There is a specific treatment for child views. A child view is a view that is subordinated a parent view. For instance
 showUrl.tooltip is subordinated to showUrl. That means the view showUrl must exist and the showUrl.tooltip child view
 is referenced in the parent object. The parent object can then use it to communicate with the child through an API.
 The child view should be designed and implemented so that it is independent of the parent view:
 - it does not use state information of the parent
 - it communicates with parent through PubSub events, which are mere notifications (do not require an answer)
 - if there is a need for roundtrip communication between child and parent, then there is a need to hold information
 about the communication state, which adds another place where state appear, and thus increase the difficulty to reason
 about the program. We then recommend to move that view inside the parent directly and the communication state in the
 parent state object. So all state modification is in identified place(s).

 NOTE(S) :
 - ERROR MANAGEMENT : if a promise is rejected while trying to compute a property, the error_handler property (function)
 in the current view whose state is being computed is executed.

 For instance showUrl.tooltip -> creation of tooltip -> tooltip object set in showUrl.state

 Flows
 Route -> views to display -> non-existing view : creation (with state_defaults??)
 -> route state -> complete state object -> compute view state -> update view
 Events -> RxEvents      -> change of route -> change of state -> change of view state
 -> change of state -- -- -- -- -- -- --

 -> ChannelEvent  |                 |-> change of model state and view state

 Stack:
 Dom manipulation : jQuery
 Template/Hierarchical views : Ractive.js
 Events : RxJS, PubSub
 Routing : Director (Flatiron)



 // module holds a reference to the module, including model, router, and view objects
 // state is the route state as passed in the URL used for routing

 */

define(['debug',
        'pubsub',
        'rsvp',
        'readerModel',
        'readerViews',
        'utils'],
       function ( DBG, PubSub, RSVP, RM, RV, UT ) {
         // logger
         var log = DBG.getLogger("readerModule");

         var rdt = {};
         rdt.name       = 'reader_tool'; // mandatory for routing, is used as the prefix for the route
           rdt.init       = function init ( module, options ) {
             // module object passed as parameter as we do not have the this attached
             // options so far is not used
             // TODO : fill-in the model with a fetch
             // TODO : no-op for now
             module.model.init();
           };
           rdt.components = {
             ReaderToolComponent : RV.ReaderToolComponent,
             Tooltip             : RV.TranslationTooltip
           };
           // This section contains all the function which have a side-effect on the persistent data storage
           // representing the model, as well as the auxiliary functions which help describing these side effect
           // and helpers which together constitute the model logic
           // if it has no side effect, it is a helper function, in which we strive to have only pure functions
           rdt.model      = RM;
           rdt.specs      = {
             'default'         : {
               view : 'showUrl'
             },
             'showUrl'         : {
               _create          : {
                 constructor : 'ReaderToolComponent',
                 params      : {
                   el     : 'airlang-rdt-tt-container',
                   append : true,
                   data   : {},
                   state  : {}
                 }
               },
               _default_state   : {
                 // DOC : shoud hold all posssible state fields : serving thus as documentation of the possible states
                 // TODO feature : should be possible to describe permanent dependencies
                 // For instance webpage_readable depends on state.url, and model.notes (but only the notes for that user, e.g. the local notes object)
                 // In the controller, I would read the dependencies and create a hash structure containing the callbacks
                 //        with their params
                 // Change of state.XX properties : state.set (prop, value) ou state.set(hash),
                 //        set function to define, state object to initialize properly in controller
                 // Reaction to change :
                 // 1. Check that effective change (o.e. not set to same value)
                 // 2. lookup callback structure for prop who changed, should find function, context, and params to execute
                 // 3. Execute function with params. That functions updates state.prop in place.
                 //        Don't forget that the state object was passed as an OUT parameter to the fn
                 // 4. If return value then we update view_state according to the returned value
                 // Note: Be careful that order should not matter
                 //       i.e. if two props depends on same prop, then their value should be the same in any order of exec
                 // 5. If change is communicated through event (model change), same
                 //      Maybe communicate all changes through events with 'change' channel?
                 url               : "",
                 module            : rdt.name,
                 webpage_readable  : undefined,
                 word_to_translate : undefined,
                 user_id           : undefined,
                 first_language    : undefined,
                 target_language   : undefined,
                 // error message field
                 error_message     : "",
                 // child view
                 tooltip           : undefined,
                 // not necessary in this version
                 lemma_target_lg   : undefined
               },
               _pubsub          : PubSub,
               url              : function ( module, view, url_state ) {
                 return {
                   url_to_load : url_state.url
                 }
               },
               webpage_readable : function ( module, view, url_state ) {
                 var model = module.model;
                 var helpers = model.helpers;

                 if (!url_state.url) {
                   return {webpage_readable : ""};
                 }

                 return new RSVP.Promise(function ( resolve, reject ) {
                   log.info("getting stored notes");
                   model.notes.fetch({
                                       module          : rdt.name,
                                       first_language  : url_state.first_language,
                                       target_language : url_state.target_language,
                                       user_id         : url_state.user_id,
                                       url             : url_state.url
                                     }).then(
                     function get_stored_notes_success ( aNotes ) {
                       log.debug("get_stored_notes_success(aNotes)", aNotes);
                       log.info("reading and presenting getting the url");
                       model.make_article_readable(url_state.url, aNotes)
                         .then(
                         function make_article_readable_success ( html_text ) {
                           log.info("URL read successfully");
                           resolve({webpage_readable : url_state.url ? html_text : "", error_message : ""});
                         },
                         function make_article_readable_error ( Error ) {
                           log.error("Error in make_article_readable", Error);
                           reject(Error);
                         }
                       );
                     },
                     function get_stored_notes_failure ( err ) {
                       log.error('get_stored_notes', err);
                       reject(err);
                     }
                   );
                 });
               }
             },
             'showUrl.tooltip' : {//NOTE: I have to keep fullname, as I can have several tooltips with differents specs
               _create        : {
                 constructor : 'Tooltip',
                 params      : {
                   el     : 'airlang-rdt-tt-container',
                   append : true,
                   data   : {},
                   state  : {}
                 }
               },
               _default_state : {
                 ev   : {clientX : 20, clientY : 20},
                 word : ''
               },
               _pubsub        : PubSub, //TODO : Maybe gather in one object event_emitter
               word           : function ( module, view, url_state ) {
                 // I need to catch a reference of the tooltip instance
                 // I also need to return a promise here
                 return new RSVP.Promise(function ( resolve, reject ) {
                   log.info("requesting translation from server for word : ", url_state.word);
                   RM.cached_translation(url_state.word, function ( err, aValues ) {
                     if (err) {
                       PubSub.err('RDT', "Error fetching translation for word : " + url_state.word);
                       log.info("Error while fetching translation for word : ", url_state.word);
                       reject(err);
                     }
                     else {
                       var result = view.helpers.showTranslation.bind(view)(url_state.word, url_state.ev, aValues);
                       if (result) {
                         // !! Here we suppose that the tooltip will be displayed without problem
                         // Big supposition, but I leave it here to show the PubSub mechanism
                         // for communication child -> parent
                         view._channel.emit(view.props.TYPE_INFO, view.props.TOOLTIP_SHOWN);
                         resolve(result);
                       }
                       else {
                         reject({err : 'Translation query did not return any values'})
                       }
                     }
                   });
                 });
               },
               ev             : function () { // already set when processing word
               }
             }
           };

         return rdt;
       });
