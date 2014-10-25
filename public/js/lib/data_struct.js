/**
 * Created by bcouriol on 2/06/14.
 */

define(['utils'], function ( UT ) {
   var DS = DS || {};

   // private variables
   const COMMENT_START_TOKEN = "<";
   const COMMENT_END_TOKEN = ">";

   DS.ParagraphData = function ParagraphData ( init_object ) {
      /* For each paragraph, calculate a series of indicators
       number of sentences
       average length of sentences in words
       number of links
       the first enclosing div
       */
      // limit cases : init_object not defined
      init_object = init_object || {};

      this.$el = init_object.$el || null;
      this.tag = init_object.tag;
      this.text = init_object.text; // text content of the tag
      this.sentence_number = init_object.sentence_number;
      this.avg_sentence_length = init_object.avg_sentence_length; //average length of sentences in words
      this.enclosing_div = init_object.enclosing_div; // first enclosing div
      this.enclosing_div_id = init_object.enclosing_div_id;
      this.enclosing_div_class = init_object.enclosing_div_class;

      this.toString = function () {
         return [this.$el.selector, this.tag, this.text.slice(0, 40), this.sentence_number, this.avg_sentence_length,
                 this.enclosing_div, "$$$"].join("\\");
      }
   };

   DS.ValueMap = function ValueMap ( init_object ) {
      /* Contains two fields, one input and one output
       This data structure is designed to cache one function value as in output = f(input);
       input and output can be any object.
       However this data structure is isolated and named here to be able to reference it by typeof
       for type checking
       */
      init_object = init_object || {};
      this.x = init_object.x;
      this.y = init_object.y;

      this.toString = function () {
         return "(" + [this.x, this.y].join(",") + ")";
      }
   };

   DS.Error = function ( error_message ) {
      this.error_message = error_message;
   };

   DS.Tooltip = (function () {
      function Tooltip ( args ) {
         var opts = $.extend({dismiss_on : 'mousemove'}, args);
         var self = this;
         var future_events = [];
         var tt;
         //var context = args["context"] || document; //for not applying events to the whole document

         function inject_css ( tt ) {
            var cssLink = document.createElement("link");
            cssLink.href = "css/tooltip_iframe.css";
            cssLink.rel = "stylesheet";
            cssLink.type = "text/css";
            tt[0].contentDocument.head.appendChild(cssLink);
         }

         function position ( x, y, tt ) {
            var pos = {};
            var margin = 5;
            var anchor = 10;

            // show popup to the right of the word if it fits into window this way
            if (x + anchor + tt.outerWidth(true) + margin < $(window).width()) {
               pos.x = x + anchor;
            }
            // show popup to the left of the word if it fits into window this way
            else if (x - anchor - tt.outerWidth(true) - margin > 0) {
               pos.x = x - anchor - tt.outerWidth(true);
            }
            // show popup at the very left if it is not wider than window
            else if (tt.outerWidth(true) + margin * 2 < $(window).width()) {
               pos.x = margin;
            }
            // resize popup width to fit into window and position it the very left of the window
            else {
               var non_content_x = tt.outerWidth(true) - tt.width();

               tt.width($(window).width() - margin * 2 - non_content_x);
               tt.contents().find('.translation').css('white-space', 'normal');

               tt.height(tt.contents().height() + 4);

               pos.x = margin;
            }

            // show popup above the word if it fits into window this way
            if (y - anchor - tt.outerHeight(true) - margin > 0) {
               pos.y = y - anchor - tt.outerHeight(true);
            }
            // show popup below the word if it fits into window this way
            else if (y + anchor + tt.outerHeight(true) + margin < $(window).height()) {
               pos.y = y + anchor;
            }
            // show popup at the very top of the window
            else {
               pos.y = margin;
            }

            return pos;
         }

         function setup_dismiss ( tt ) {
            if (opts.dismiss_on == 'mousemove') {
               $(document).on('mousemove_without_noise', self.hide);
               $(window).scroll(self.hide);
            }
            else {
               $(document).keydown(escape_hide_handler);
               tt.contents().keydown(escape_hide_handler);
            }
         }

         function escape_hide_handler ( e ) {
            if (e.keyCode == 27) {
               self.hide();
            }
         }

         function bind_future_events ( tt ) {
            future_events.forEach(function ( event ) {
               tt.contents().find(event.selector).on(event.event, event.action);
            })
         }

         function set_text_direction ( text_direction, tt ) {
            tt.contents().find('.pos_translation').css('direction', text_direction || 'ltr');
         }

         this.remove = function () {
            tt.remove();
         };

         this.show = function ( x, y, content, text_direction ) {
            logEntry("tooltip show");
            tt[0].contentDocument.body.innerHTML = content;

            self.resize();

            var pos = position(x, y, tt);

            // I don't know why by calling this second time makes the popup height resize properly.
            // Maybe some things are lazy evalutated? No idea.
            pos = position(x, y, tt);

            self.resize();

            setup_dismiss(tt);

            bind_future_events(tt);

            set_text_direction(text_direction, tt);

            tt.css({ top : pos.y, left : pos.x, display : 'block'});

            logExit("tooltip show");
         };

         this.hide = function () {
            //tt.css('display', 'none');
            tt.html("");
         };

         this.is_hidden = function () {
            return !tt || tt.css('display') == 'none';
         };

         this.is_visible = function () {
            return tt && !this.is_hidden();
         };

         this.find = function ( selector ) {
            return tt.contents().find(selector);
         };

         this.bindFutureEvent = function ( event, selector, action ) {
            future_events.push({event : event, selector : selector, action : action});
         };

         this.resize = function () {
            logEntry("resize tooltip");
            logWrite(DBG.TAG.DEBUG, "tt contents height", tt.contents().height());
            // don't know why we have to do it like this for it to work...
            tt.height(tt.contents().height());
            tt.css("height", "auto");
            tt.height(tt.contents().height());
            tt.width(tt.contents().width() + 10);
            tt.css("width", "auto");
            tt.width(tt.contents().width() + 10);
            logExit("resize tooltip");
         };

         tt = $('<iframe>', {
            css   : {
               background      : '#fcf7d9',
               'text-align'    : 'left',
               'border-style'  : 'solid',
               'border-width'  : '1px',
               'border-color'  : '#ccc',
               'box-shadow'    : 'rgba(0,0,0,0.2) 0px 2px 5px',
               position        : 'fixed',
               'border-radius' : '5px',
               'z-index'       : 2147483647,
               top             : '-1500px',
               display         : 'none'
            },
            class : 'transover-tooltip'
         }).appendTo('body');

         inject_css(tt);
      }

      return Tooltip;
   })();

   var mapDataAdapters;
   DS.filter_register_data_adapters =
   function register_data_adapters ( input_type, output_type, fn_adapter, adapter_name ) {
      /**
       * Purpose : Register functions who can transform a data type (input_type) into another data type (output_type).
       *           Such functions are stateless, i.e. their output is only function of their input (pure function)
       * Arguments :
       * @param {string} input_type
       * @param {string} output_type
       * @param {function} fn_adapter
       * @param {string} adapter_name : adapter_name is optional, a name will be created either from the adapter
       *                                function name or from the types
       * Note : the adapter is stored in an array
       * Returns :
       * The array which contains all the data adapters registered
       *
       * Throws :
       * - various errors if input arguments do not pass some validation test
       */
      if (!input_type) {
         throw 'register_data_adapters: falsy value of input_type passed, input_type is mandatory'
      }
      if (!output_type) {
         throw 'register_data_adapters: falsy value of output_type passed, output_type is mandatory'
      }
      if (!fn_adapter) {
         throw 'register_data_adapters: falsy value of fn_adapter passed, adapter function is mandatory'
      }
      if (!adapter_name || adapter_name.length === 0) {
         adapter_name = fn_adapter.name || [input_type, 'TO', output_type].join("");
      }
      mapDataAdapters = mapDataAdapters || {};

      // now we wrap the name of the properties to avoid naming conflicts

      input_type = wrap(input_type, '_');
      output_type = wrap(output_type, '_');

      mapDataAdapters[input_type] = mapDataAdapters[input_type] || {};
      var map_val = mapDataAdapters[input_type][output_type] = mapDataAdapters[input_type][output_type] || [];
      map_val.push({fn_adapter : fn_adapter, adapter_name : adapter_name});
      return mapDataAdapters; //return that value for checking purposes
   };

   DS.filter_get_data_adapter = function get_data_adapter ( input_type, output_type, optional_name ) {
      /**
       * Purpose : Returns a previously registered data adapter based on a lookup on input_type, output_type first
       *           and then based on the optional parameter name if any.
       * Arguments :
       * @param {string} input_type
       * @param {string} output_type
       * @param {string} adapter_name : adapter_name is optional.
       *
       * Returns :
       * if input_type = output_type, returns identity function (x -> x)
       * if optional_name is set, and can be found in the registered array, that filter is returned. Otherwise an exception
       * is thrown.
       * If no optional_name, and there are several adapters, anyone can be returned, here we return the first one,
       * as we are sure of its existence
       *
       * Throws :
       * - various errors if input arguments do not pass some validation test
       * - if no data adapter for the corresponding parameters is registered
       */
      if (input_type === output_type) {
         return DS.filter_fn_identity;
      }

      var _input_type = wrap(input_type, '_');
      var _output_type = wrap(output_type, '_');
      var i_type = mapDataAdapters[_input_type];
      if (!i_type) {
         throw 'getDataAdapter: no registered data adapters for input_type ' + input_type;
      }
      var aAdapters = mapDataAdapters[_input_type][_output_type];
      if (!aAdapters || aAdapters.length === 0) {
         throw 'getDataAdapter: no registered data adapters for (input_type, output_type) = (' + input_type + ", "
                  + output_type + ")";
      }

      // Note: aAdapters is an array
      if (optional_name && optional_name.trim().length > 0) {
         var bFound = false;
         var fn_found;
         aAdapters.some(
            function ( o_adapter ) {
               if (o_adapter.adapter_name === optional_name.trim()) {
                  bFound = true;
                  fn_found = o_adapter.fn_adapter;
                  return bFound;
               }
            });
         if (!bFound) {
            throw 'get_data_adapter: could not find the data adapter with name ' + optional_name;
         }
         return fn_found;
      }
      else {
         return aAdapters[0].fn_adapter;
      }
   };

   var mapFilters;
   DS.filter_register = function register_filter ( input_type, output_type, fn_filter, filter_name ) {
      /**
       * Purpose : Register filters which are functions which leave their input unchanged, while adding action to it
       *           the action is a function mapped to the token. Ideally, a couple of filters going from one type to
       *           the other should leave the input unchanged : input_type -> output_type -> input_type  =  ID;
       * Description : Actions are not executed on the token, it is just mapped
       *               For instance: input = [token] -> output = [token, action]
       *               Filters are stored in an array
       *               Filter names are internally wrapped within underscore ('_') to avoid naming conflict
       *                 with predefined internal object properties
       * Arguments :
       * @param {string} input_type
       * @param {string} output_type
       * @param {function} fn_filter
       * @param {string} filter_name : filter_name is optional, a name will be created from the filter function name
       * Returns :
       * The internally kep array of registered filters
       * Throws :
       * - various errors if input arguments do not pass some validation test
       */
      if (!input_type) {
         throw 'register_filter: falsy value of input_type passed, input_type is mandatory'
      }
      if (!output_type) {
         throw 'register_filter: falsy value of output_type passed, output_type is mandatory'
      }
      if (!fn_filter) {
         throw 'register_filter: falsy value of fn_filter passed, filter function is mandatory'
      }
      if (!filter_name || filter_name.length === 0) {
         filter_name = fn_filter.name;
      }
      if (!filter_name || filter_name.trim().length === 0) {
         throw 'register_filter: no name found for fn_filter passed, name of filter function is mandatory'
      }
      mapFilters = mapFilters || {};

      // now we wrap the name of the properties to avoid naming conflicts

      filter_name = wrap(filter_name.trim(), '_');
      if (mapFilters[filter_name]) {
         logWrite(
            DBG.TAG.WARNING,
            'register_filter: trying to register a filter with a name of a filter already existing : overwriting');
      }
      mapFilters[filter_name] = fn_filter;
      fn_filter.input_type = input_type;
      fn_filter.output_type = output_type;
      fn_filter.filter_name = filter_name;

      return mapFilters; //return that value for checking purposes
   };

   DS.filter_default = function filter_default ( token ) {// id function
      return token;
   };

   DS.filter_fn_identity = function default_identity_filter ( token ) {// id function
      return token;
   };

   DS.filter_fn_highlight_comment = function filter_fn_highlight_comment ( token ) {return token;};

   DS.filter_get_filter = function get_filter ( filter_name ) {
      /**
       * Purpose : Returns a previously registered filter based on a lookup by its name
       * @param {string} input_type
       * @param {string} output_type
       * @param {function} fn_filter
       * @param {string} filter_name : filter_name is optional, a name will be created from the filter function name
       *
       * Throws :
       * - filter is not registered or cannot be found
       */
      if (!mapFilters) {
         throw 'getFilter: no filter has been registered so far'
      }
      filter_name = wrap(filter_name, '_');
      var filter = mapFilters[filter_name];
      if (!filter) {
         throw 'getFilter : no filter with the name ' + filter_name + " is registered!"
      }
      return filter;
   };

   DS.filter_is_comment_start_token = function is_comment_start_token ( token ) {
      return (token === COMMENT_START_TOKEN);
   };

   DS.filter_is_comment_end_token = function is_comment_end_token ( token ) {
      return (token === COMMENT_END_TOKEN);
   };

   DS.filter_comment_remover = function filter_comment_remover(aTokens) {
      var aCommentPos = [];
      var elemPos = {};

      function reset ( elemPos ) {
         elemPos.pos = undefined;
         elemPos.aCommentToken = [];
      }

      reset(elemPos);
      var commentParseState = false;
      var justFoundCommentStartToken = false;

      aTokens.forEach(
         function ( token, index, array ) {
            justFoundCommentStartToken = false;
            if (DS.filter_is_comment_start_token(token)) {
               commentParseState = true;
               // state variable which indicates that we are going to read the content between comment tokens
               justFoundCommentStartToken = true;
               // this is necessary for the case when comment token is delimited by the same characters

               elemPos.pos = index;
            }

            if (commentParseState == true) {
               // keeping this in between allows to write in the array both begin and end comment token
               elemPos.aCommentToken.push({token : token, action : DS.filter_fn_highlight_comment});
            }

            if (!justFoundCommentStartToken && DS.filter_is_comment_end_token(token)) {
               function clone ( elemPos ) {
                  return {
                     pos           : elemPos.pos,
                     aCommentToken : elemPos.aCommentToken
                  }
               aCommentPos.push(clone(elemPos));
               commentParseState = false;
               reset(elemPos);
               }
            }

         });
      return aCommentPos;
   };

   DS.promise_value_adapter = function promise_value_adapter ( value, result_callback ) {
      /**
       * The idea here is to have a wrapper to have the same code running whether it is a deferred or a regular value
       * In the filtering mechanism we have to apply a callback to swithc datatypes from filter functions
       * So we want to execute that callback whether the filter returns a value or a promise
       * The key trick here is that the callback has to RETURN something, which it should not have to do if it was
       * just resolving the deferred.
       * So basically, we can reuse code, but with important caveats (SOURCE OF BUGS!!)
       */
      return {
         promise : (typeof value.promise === 'function') ?
                   value.promise :
                   function () {return result_callback(null, value);},

         // this case should never happen for a normal value returned by a synchronous function
         reject  : (typeof value.reject === 'function') ?
                   value.reject :
                   function () {throw 'rejecting return value from synchronous function for what??'},

         resolve : (typeof value.resolve === 'function') ? value.resolve : function ( val ) {return val}
      }
   };

   return DS;
});
