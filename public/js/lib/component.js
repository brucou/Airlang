/**
 * Created by bcouriol on 24/06/15.
 */

define(['debug', 'ractive', 'utils'], function ( DBG, Ractive, UT ) {
   var Component =
      Ractive.extend({
                        _props   : {
                           symbolIdSelector    : '#',
                           symbolClassSelector : '.'
                        },
                        _helpers : {
                           /* Helpers function */
                           jQueryfyID    : function jQueryfyID ( selector ) {
                              return $(this.props.symbolIdSelector + selector)
                           },
                           jQueryfyClass : function jQueryfyClass ( selector ) {
                              return $(this.props.symbolClassSelector + selector)
                           },
                           bindTo        : function bindTo ( bindTo, copyTo, objToBind ) {
                              Object.keys(objToBind).forEach(function ( helper_key ) {
                                 if (typeof (objToBind[helper_key]) === 'function') {
                                    copyTo[helper_key] = objToBind[helper_key].bind(bindTo);
                                 }
                              });
                           },
                           go            : function go ( router, module_name, view_list, aViews ) {
                              // For instance [{ action: 'showUrl', state: self.state },
                              //               {action: 'showUrl.tooltip', state: {word: word, ev: ev} }]
                              var objRoute = {};
                              aViews.forEach(function ( hash ) {
                                 objRoute[hash.action] = {};
                                 objRoute[hash.action].state = hash.state;
                              });
                              view_list
                                 .filter(function ( view_name ) {
                                            return view_name.indexOf('.') !== -1
                                         })
                                 .forEach(function ( view_name ) {
                                             var path_split = UT.split_xpath(view_name, '.');
                                             if (path_split.dirname.length > 0) {
                                                // we have a child view, undefine/remove the corresponding property in the parent
                                                // NOTE : undefine is enough as JSON do not parse undefined properties
                                                // console.log("deleting from route field ", view_name);
                                                UT.traverse_dir_xpath(objRoute, path_split.dirname).state[path_split.filename] =
                                                undefined;
                                             }
                                          });

                              // Algorithm insuficient here, I need to
                              // parse all spec keys, and keep a list of children
                              // then here go through the objRoute keys are remove all properties with children name
                              // basically once I have the list, this is

                              console.log("Route change to : ", '/' + module_name + '/' +
                                                                JSON.stringify(objRoute));
                              router.setRoute('/' + module_name + '/' + JSON.stringify(objRoute));
                           }
                        },

                        onconstruct : function ( options ) {
                           // cf. http://docs.ractivejs.org/latest/components for explanation of options and beforeInit
                           console.log("Component construction : ", options)
                        },

                        onrender : function () {
                           var self = this;
                           /* Helpers function */
                           function bindTo ( bindTo, copyTo, objToBind ) {
                              if (objToBind) {
                                 Object.keys(objToBind).forEach(function ( helper_key ) {
                                    if (typeof (objToBind[helper_key]) === 'function') {
                                       copyTo[helper_key] = objToBind[helper_key].bind(bindTo);
                                    }
                                 });
                              }
                           }

                           function defineEvents ( context ) {
                              /* For each event/Rx observable :
                               call the factory function registered to create the observable
                               in the context passed as parameter
                               The context is the 'class' with properties such as view, ractive, helpers, etc.
                               */
                              var events = context.actions;
                              if (events) {
                                 Object.keys(events).forEach(function ( Rx_obs ) {
                                    context['Observables'] = context['Observables'] || {};
                                    var t = context['Observables'][Rx_obs] = events[Rx_obs](context);
                                    if (!(t instanceof Rx.Observable)) {
                                       throw 'ERROR : Configuration of events source in module '
                                                + context.module
                                          + ' : expected type Rx.Observable!'
                                    }
                                 })
                              }
                           }

                           function attachHandlers ( context ) {
                              /* For each handler :
                               subscribe the handler to its observable
                               to be called in the context passed as parameter
                               The context is the 'class' with properties such as view, ractive, helpers, etc.
                               */
                              var handlers = context.handlers;
                              if (handlers) {
                                 var onError = {
                                    Rx_H_error : function ( error ) {
                                       console.log(error);
                                       console.log(this);
                                       throw error;
                                    }
                                 };
                                 context.handlers_id = context.handlers_id || {};
                                 Object.keys(handlers).forEach(function ( Rx_obs ) {
                                    // subscribe the handlers to the source, pass the view as first parameters and
                                    // keep a reference to unsubscribe later
                                    context.handlers_id[Rx_obs] =
                                    context['Observables'][Rx_obs].subscribe(handlers[Rx_obs].bind(context, context), onError.Rx_H_error);
                                 });
                              }
                           }

                           function bindViewHelpers ( context ) {
                              bindTo(context, context.helpers.view, context.helpers.view);
                           }

                           function bindInstanceHelpers ( context ) {
                              bindTo(context, context.helpers, context.helpers);
                           }

                           function attachChannelListeners ( self ) {
                              function tt_listener ( view, listeners, channel, message ) {
                                 console.log("EVENT : on channel ", channel, " receiving message type", message.type);
                                 UT.apply_to_props(listeners[channel], function process_messages ( channel_listener, message_type ) {
                                    if (message.type === message_type) {
                                       // Note : inverting message and channel, as channel should not be necessary to handle the message
                                       channel_listener[message_type](view, message, channel);
                                       console.log("EVENT : on channel ", channel, " processed message type ", message_type);
                                    }
                                 });
                              }

                              // Semantics : channel or listeners -> pubsub object must be there
                              var pubsub = self.pubsub; // Object which implements the PubSub interface, i.e. publish, subscribe
                              var channel = self.channel;
                              var listeners = self.listeners;
                              if ((channel || listeners) && (!pubsub)) {
                                 console.log("ERROR : Semantics : channel and listeners are configured for (Component %s) but no event emitter is!", this.name);
                                 throw 'ERROR : Semantics : channel and listeners are configured for (Component ' +
                                       this.name + '%s) but no event emitter is!';
                              }
                              // attach channel emit function to channel property
                              if (channel) {
                                 var channel_name = channel;
                                 self._channel = {
                                    emit : function emit ( data_type, data_content ) {
                                       console.log(" EVENT : emitting on channel ", channel_name, " data : ", data_type, data_content);
                                       pubsub.publish(channel_name, {type : data_type, content : data_content});
                                    }
                                 };
                              }
                              else {
                                 self._channel = {emit : function fake_emit () {
                                    pubsub.err('CHANNEL', 'attempting to emit messages through channel which has not been defined');
                                 }}
                              }
                              // attach listeners also to channels
                              if (listeners) {
                                 listeners._tokens = [];
                                 listeners._channels = {};
                                 UT.apply_to_props(listeners, function ( listeners, channel ) {
                                    if (channel[0] !== '_') { // excluding the _tokens I just created
                                       // bind the listeners to the view, and pass view as first parameter
                                       listeners._tokens.push(pubsub.subscribe(channel, tt_listener.bind(self, self, listeners)));
                                    }
                                 });
                              }
                           }

                           function attachErrorHandlers ( self ) {
                              if (!self.error_handler) {
                                 self.error_handler = function generic_error_handler ( view, error ) {
                                    logWrite(DBG.ERROR, "error occurred in view %s : %s", view.name, error);
                                 }
                              }
                           }

                           // This points to the ractive structure with el, template, etc., so we cannot use this.helpers
                           console.log('Component constructed:');
                           console.log(this);

                           // Copy static props into instance props property
                           // NOTE : this strange code is to move properties in prototype to instance level, so they can be seen in debugger
                           UT._extend(this._props, this.props || {});
                           this.props = this._props;

                           // Copy static helpers into instance helpers property
                           UT._extend(this._helpers, this.helpers || {});
                           this.helpers = this._helpers;

                           // Write dispose handlers to remove Rx observables
                           this.dispose = function ( event ) {
                              console.log('Detaching Rx event handlers : ', this.name);
                              console.log(this);
                              // Remove Rx listeners
                              if (this.handlers) {
                                 Object.keys(this.handlers).forEach(function ( Rx_obs ) {
                                    self.handlers_id[Rx_obs].dispose();
                                 })
                              }
                              // Remove PubSub listeners
                              if (this.listeners && this.listeners.tokens) {
                                 // TODO : error, correct, PubSub must be found in object
                                 this.listeners.tokens.forEach(this.pubsub.unsubscribe);
                              }
                           };

                           // Set up events, actions and handlers and bind them
                           defineEvents(this);
                           attachHandlers(this);
                           // bind and move view helpers to the ractive object (ractive.helpers.view b. view)
                           bindViewHelpers(this);
                           // bind in place helpers to the ractive object (ractive.helpers b. view)
                           bindInstanceHelpers(this);
                           delete this.actions;
                           // attach the listeners for the misc. channels defined
                           attachChannelListeners(this);

                           // Set-up the go helpers at view level
                           this.go = function go ( aViews ) {
                              this._helpers.go(this.router, this.module.name/*name*/, this._view_list, aViews);
                           };

                           // Set-up the cleanup handlers
                           this.on('teardown', this.dispose.bind(this));

                           // Set-up the error handlers
                           attachErrorHandlers(this);
                        }
                     });

   return Component;
});
