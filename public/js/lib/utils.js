/**
 * Created by bcouriol on 13/06/14.
 * TODO: Error treatment
 * - error treatment!!!!
 * - check & validate util functions
 * A lot of those functions have a callback err, result. The question is how to react and propagate those errors
 * TODO: consistency between text handling text functions and utils tex functions
 * - isPunct for example
 * - - would be nice if punct list of characters would be language-dependant
 * - - also word split function and the like in text handling should reuse the text utils here to ensure consistency
 * - isNaN
 * - - isNaN recognizes english formatting of numbers only
 */

function utilsFactory(DBG, RSVP) {
  // logger
  var log = DBG.getLogger("utils");

  Array.prototype.isItArray = true;

   var slice = Array.prototype.slice;

   var rePUNCT = /[ \,\.\$\uFFE5\^\+=`~<>{}\[\]|\u3000-\u303F!-#%-\x2A,-\/:;\x3F@\x5B-\x5D_\x7B}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]+/g;

   function getIndexInArray(aArray, field_to_search, value) {
      var i, iIndex = -1;
      for (i = 0; i < aArray.length; i++) {
         if (aArray[i][field_to_search] === value) {
            iIndex = i;
            break;
         }
      }
      return iIndex;
   }

   function isArray(ar) {
      return Array.isArray(ar) || (typeof ar === 'object' && objectToString(ar) === '[object Array]');
   }

   function async_cached(f, initialCache) {
      /*
       TODO TO UPDATE!!! We now a library for caching
       Function who takes a function and returns an cached version of that function which memorized past computations
       A cache object can be passed as a parameter. That cache object must implement the following interface:
       - getItem
       - setItem
       In addition it can also implement:
       - clear
       - toHtmlString
       - removeItem
       - removeWhere
       - size
       - stats
       @param f: the function to be applied. f takes an object and output another one
       @param initial_cache : a specific cache implemention OR if none, an array of valueMap object which are simply couples (x,y) where y=f(x), OR []
       */
      var cvCachedValues;
      var self = this;

      if (!initialCache) {//no cache passed as parameter
         log.info("async function will not be cached");
      }
      else {
         cvCachedValues = initialCache; // if a cache is passed in parameter then use that one
      }

      var async_cached_f = function cached_fn(value, f_node_callback) {
         logEntry("async_cached_f");

         var fValue = null;
         if (cvCachedValues) { // if function is cached
            fValue = cvCachedValues.getItem(value);
            if (fValue) {
               // value already cached, no callback, no execution, just assigning the value to the output array
               log.debug("Computation for value already in cache!", value,
                        fValue);
               logExit("async_cached_f");
               return f_node_callback(null, fValue); //TODO check if callback is node type or not
            }
         }
         fValue = f(value, callback);

         logExit("async_cached_f");
         return fValue;

         function callback(err, result) {
            logEntry("async cached callback");
            if (cvCachedValues) {
               // TODO: do I really want to cache also errors??
               cvCachedValues.setItem(value, err ? null : result);
            }
            f_node_callback(err, result);
            logExit("async cached callback");
         }
      };
      //!! this is not a standard function, only used for tracing purposes on Chrome
      async_cached_f.displayName = f.name;
      async_cached_f.cache = cvCachedValues;
      async_cached_f.f = f; // giving a way to return to the original uncached version of f)

      return async_cached_f;
   }

   function trimInput(value) {
      return value.replace(/^\s*|\s*$/g, '');
   }

   function isNotEmpty(value) {
      if (value && value !== '') {
         return true;
      }
   }

   function isEmail(value) {
      var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (filter.test(value)) {
         return true;
      }
   }

   function arrayToHash(array) {
      var hash = {};

      array.forEach(function (val, idx) {
         hash[val] = true;
      });

      return hash;
   }

   function injectArray(aSource, aToInject, pos) {
      return aSource.splice.apply(aSource, [pos, 0].concat(aToInject));
   }

   function isRegExp(re) {
      return typeof re === 'object' && objectToString(re) === '[object RegExp]';
   }

   function isFunction(object) {

      return !!(object && typeof object.constructor !== "undefined" && typeof object.call !== "undefined" &&
                typeof object.apply !== "undefined");

      // return typeof obj === 'function' && toString.call(obj) == '[object Function]';
      // this is a more precise version but slower
   }

   // taken from RSVP.helpers.isPromise
   function isPromise(p) {
      return !!p && typeof p.then === 'function';
   }

   function isString(obj) {
      return obj && (typeof teststring === "string");
      // return obj && toString.call(obj) == '[object String]';
      // this is a more precise version but slower
   }

   function isPunct(char) {
      // return true if the character char is a punctuation sign
      // TODO: improve to adjust list of punctuation by language
      if (char.length > 1) {
         return null;
      }
      else {
         return (rePUNCT.exec(char));
      }
   }

   function isDate(d) {
      return typeof d === 'object' && objectToString(d) === '[object Date]';
   }

   function isError(e) {
      return typeof e === 'object' && objectToString(e) === '[object Error]';
   }

  function isNumberString(text) {
    // issue: isNaN recognizes english formatting of numbers only
    return !isNaN(text);
  }

  function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
         constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
         }
      });
   };

   function _extend(origin, add) {
      // Don't do anything if add isn't an object
      if (!add || typeof add !== 'object') {
         return origin;
      }

      var keys = Object.keys(add);
      var i = keys.length;
      while (i--) {
         origin[keys[i]] = add[keys[i]];
      }
      return origin;
   }

   // definition of helper function format, similar to sprintf of C
   // usage : String.format('{0} is dead, but {1} is alive! {0} {2}', 'ASP', 'ASP.NET');
   // result : ASP is dead, but ASP.NET is alive! ASP {2}

   if (!String.format) {
      String.format = function (format) {
         var args = slice.call(arguments, 1);
         return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
         });
      };
   }

   /**
    * Return a timestamp with the format "m/d/yy h:MM:ss TT"
    * @type {Date}
    */
   function timeStamp() {
      // Create a date object with the current time
      var now = new Date();

      // Create an array with the current month, day and time
      var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

      // Create an array with the current hour, minute and second
      var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

      // Determine AM or PM suffix based on the hour
      var suffix = ( time[0] < 12 ) ? "AM" : "PM";

      // Convert hour from military time
      time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

      // If hour is 0, set it to 12
      time[0] = time[0] || 12;

      // If seconds and minutes are less than 10, add a zero
      for (var i = 1; i < 3; i++) {
         if (time[i] < 10) {
            time[i] = "0" + time[i];
         }
      }

      // Return the formatted string
      return date.join("/") + " " + time.join(":") + " " + suffix;
   }

  function timestamp() {
    var d = new Date();
    var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
    return [d.getDate(), months[d.getMonth()], time].join(' ');
  }

   function OutputStore(init) {
      // constructor
      var self = this;

      var defaults = {countDown: 1, aStore: [], err: null, deferred: null};
      defaults.propagateResult = function (err) {
         //prepare the reault values and call the callback function with it
         // but call it with objects indicating success or failure
         //logEntry("propagateResult");
         /*         if (self.deferred) {
          if (err) {
          log.error("error while propagating result in OutputStore from async call!");
          self.deferred.reject(err);
          }
          else {
          log.debug("Successfully resolved promise with result from async call");
          self.deferred.resolve(self.aStore);
          }
          }
          */
         self.callback(err, self.aStore/*, self.deferred*/);
         //logExit("propagateResult");
      }; // default parameters, execute action after 1 value is stored
      defaults.callback = function (err, result) {
         log.warning("no callback function for asynchronous function call!");
         log.debug("err, result", err, UT.inspect(result));
      };

      init = init || defaults;

      this.err = defaults.err;
      this.aStore = init.aStore || defaults.aStore;
      this.callback = init.callback || defaults.callback;
      this.countDown = init.countDown || defaults.countDown;
      this.propagateResult = init.propagateResult || defaults.propagateResult;
      this.deferred = init.deferred || defaults.deferred;
      this.setDeferred = function setDeferred(dfr) {
         this.deferred = dfr;
      };
      this.getDeferred = function getDeferred() {
         return this.deferred;
      };

      this.setErr = function (err) {
         this.err = err;
      };
      this.getErr = function () {
         return this.err;
      };
      this.toString = function () {
         // print the concatenation of all values in storage
         var formatString = "";
         this.aStore.forEach(function (element, index, array) {
            if (element) {
               if (isPunct(element)) {
                  var SEP_CHAR = "";
               }
               else {
                  var SEP_CHAR = " ";
               }
               formatString = [formatString, element.toString()].join(SEP_CHAR);
            }
         });
         return formatString;
      };
      this.setValueAt = function (pos, value) {
         // set some value at index pos
         this.aStore[pos] = value;
      };
      this.getValueAt = function (pos) {
         // get the value at index pos
         return this.aStore[pos];
      };
      this.getValuesArray = function () {
         return this.aStore;
      };
      this.invalidateAt = function (pos) {
         // update the counter to reflect callback who already returned
         // if all callbacks returned then we can execute the final function to propagate results where it matters
         //logEntry("invalidateAt");
         this.countDown = this.countDown - 1;
         if (this.countDown == 0) {
            this.propagateResult(self.err);
         }
         //logExit("invalidateAt");
      };
      this.push = function (value) {
         // add a value in the store and return an index to it
         this.aStore.push(value);
         return this.aStore.length - 1;
      }
   }

   function remove_extra_spaces(text) {
      // Example : "    This    should  become   something          else   too . ";
      // -> "This should become something else too.";
      return text.replace(/\s+/g, " ");
   }

   /**
    * Return the text without punctuation sign ; extra spaces are also removed
    * @param text
    * @returns {String}
    */
   function remove_punct(text) {
      // cf: http://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
      // Example :"This, -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation";
      var punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~]/g;
      var spaceRE = /\s+/g;
      return text
         .replace(punctRE, '')
         .replace(spaceRE, ' ');
   }

   function escape_html(text) {
      // utility function taken from TransOver google extension
      return text.replace(XRegExp("(<|>|&)", 'g'), function ($0, $1) {
         switch ($1) {
            case '<':
               return "&lt;";
            case '>':
               return "&gt;";
            case '&':
               return "&amp;";
         }
      });
   }

   function wrap_string(wrap_begin, word, wrap_end) {
      return [wrap_begin, word, wrap_end].join("");
   }

   function split_xpath(str, sep) {
      var aTrunks = str.split(sep);
      var dirname, filename;
      filename = aTrunks.pop();
      return {
         dirname: aTrunks,
         filename: filename
      }
   }

   function traverse_dir_xpath(origin, dirname) {
      if (!(dirname instanceof Array)) {
         dirname = [dirname];
      }
      return dirname.reduce(function (prev, next) {// go down the path, starting from views
         return prev[next];
      }, origin)
   }

   // left padding s with c to a total of n chars
   function padding_left(s, c, n) {
      if (!s || !c || s.length >= n) {
         return s;
      }

      var max = (n - s.length) / c.length;
      for (var i = 0; i < max; i++) {
         s = c + s;
      }

      return s;
   }

   // right padding s with c to a total of n chars
   function padding_right(s, c, n) {
      if (!s || !c || s.length >= n) {
         return s;
      }

      var max = (n - s.length) / c.length;
      for (var i = 0; i < max; i++) {
         s += c;
      }

      return s;
   }

   function fragmentFromString(strHTML) {
      var temp = document.createElement('template');
      temp.innerHTML = strHTML;
      return temp.content;
   }

   /**
    * Returns two arrays containing the object properties on one hand, and the properties' value on the other hand
    * @param obj {Object}
    * @returns {{properties: Array, values: Array}}
    */
   function separate_obj_prop(obj) {
      var aArgs = [],
          prop_array = [],
          temp_array = [], // temp_array holds the $1, $2, for the arguments. 1 is offset by $index_param
          index = 0,
          aProp = Object.keys(obj);

      aProp.forEach(function (prop, index, array) {
         prop_array.push(prop);
         aArgs.push(obj[prop]);
      });
      return {properties: prop_array, values: aArgs}
   }

   function fn_get_prop(prop_name) {
      return function (obj) {
         return obj[prop_name];
      }
   }

   function apply_to_props(obj, fn) {
      Object.keys(obj).forEach(function (key) {
         fn(obj, key);
      })
   }

   function fn_not(predicate) {
      return function () {
         return !predicate(arguments)
      }
   }

   function starts_with(char) {
      return function (str) {
         return str[0] === char
      }
   }

   function fn_get_public_props(specs, char) {
      return Object.keys(specs)
         .filter(fn_not(starts_with(char)));
   }

   function parsedToken_count_tag(aHTMLTokens, tagName) {
      return aHTMLTokens.reduce(function (prev, html_token) {
         return prev + (html_token.name === tagName)
      }, 0);
   }

   /**
    * Purpose : Parse a DOM Tree whose root is given by $el
    * Action  : Add a html line corresponding to the tag at hand and number it sequentially for later identification
    * Tags and attributes name can be mapped according to mapAttrClass and mapTagClass
    * MapAttrClass is a double mapping (attribute, value) -> "attribute = `mapping((attribute, value)`"
    * MapTagClass is a simple mapping (tagName) -> "class = mapping(tagName)"
    * MapAttrClass[attribute] has to be always in lower case (cf. Assumption)
    *   MapAttrClass[attribute] can also be configured for cases where 'attribute' is not present in element
    *   To that purpose one has to configure a mapping for undefined. Ex: MapAttrClass[attribute][undefined] = XX
    * ASSUMPTION :
    * - the $el is at the top of a DOM tree starting with an html tag (span, div, etc.).
    *   i.e. it cannot be a text node
    * - this number must be unique in the whole document (we use id=x) to later retrieve it
    *   with $(#id)
    * - configuration of mapAttrClass in lower case. Ex : ['class']['title'] vs. ['class']['Title']
    * @param {jQuery} $el The root of the tree from which the parsing starts
    * @param {map} mapAttrClass MapAttrClass is a double mapping (attribute, value) -> "attribute = `mapping((attribute, value)`"
    * @param {map} mapTagClass MapTagClass is a simple mapping (tagName) -> "class = mapping(tagName)"
    * @param {boolean} flag_no_transform optional. If true, tags are converted with their attributes to HTML
    * @returns {{aHTMLparsed: Array, aCommentPos: Array, html_parsed_text: string, aTokens: (*|Array)}}
    */
   function parseDOMtree($el, mapTagClass, mapAttrClass, /* boolean optional */ flag_no_transform) {
      // TODO: check el is a Jquery element or a DOM element, if a DOM convert to Jquery
      if (!($el instanceof jQuery)) {
         throw 'parseDOMtree: called with parameter $el, expected JQuery object, found type ' + (typeof $el)
      }

      var node_index = 0,
          comment_index = 0,
          aHTMLparsed = [],
          aHTMLtokens = [],
          aCommentPos = [],
          elemPos = {};

      _parseDOMtree($el, aHTMLparsed, aHTMLtokens, aCommentPos);
      var html_parsed_text = aHTMLparsed.join(" ");

      //log.debug("parsed HTML", aHTMLparsed.join("\n"));
      return {
         aHTMLparsed: aHTMLparsed,
         aHTMLtokens: aHTMLtokens,
         aCommentPos: aCommentPos,
         html_parsed_text: html_parsed_text,
         aTokens: html_parsed_text.split(" ")
         //There are spaces in aHTMLparsed, so this split op is not trivial x->x
      };

      function _parseDOMtree($el, aHTMLparsed, aHTMLtokens, aCommentPos) {

         /////// Helper functions

         // Initialize comments structure for isolating non-text nodes
         function reset(/*out*/ elemPos) {
            elemPos.pos = undefined;
            elemPos.aCommentToken = [];
         }

         function clone(elemPos) {
            return {
               pos: elemPos.pos,
               aCommentToken: elemPos.aCommentToken
            };
         }

         function simple_tokenizer(text) {
            /**
             * Tokenizer :   text => [token] (word array)
             */
            var aTokens = text.split(" ");
            aTokens.type = 'token';
            return aTokens;
         }

         function simple_detokenizer(aTokens) {
            return aTokens.join(" ");
         }

         // Set the html content which is not a text node as a comment
         function comment_tag_out(html_tag) {
            reset(elemPos);
            elemPos.pos = comment_index;
            simple_tokenizer(html_tag).forEach(function (token) {
               elemPos.aCommentToken.push({token: token, action: identity});
               comment_index++;
            });
            // account for the extra space we will add after the ending >
            // This is necessary as otherwise
            // <tag end><tag end> is 3 tokens, and that is counted as 4
            // so we will have to transform it to <tag end> <tag end> to reconcile the token position with the index
            aCommentPos.push(clone(elemPos));
         }

         var html_begin_tag,
             tag_name = $el.prop("tagName");

         // Do nothing if there is no tag_name for some reason
         if (!tag_name) {
            return;
         }

         if (flag_no_transform) {
            // case when flag_no_transform is true
            // in that case we don't read mapAttr and else, we convert the tag attributes to html
            var arr = [];
            arr.push("<" + tag_name);
            var aDomAttributes = slice.call($el[0].attributes);
            aDomAttributes.forEach(function (attribute) {
               arr.push(attribute.nodeName + "='" + attribute.value + "'");
            });
            html_begin_tag = arr.join(" ") + ">";
         }
         else {// read the attributes to map from mapAttrTagClass -> array
            var aAttributes = Object.keys(mapAttrClass);
            // for each attribute in the array, read the corresponding value from $el
            // and perform the mapping if there is one to perform
            var html_class_attr = aAttributes.reduce(function (accu, attribute) {
               var attr_value_in_$el = $el.attr(attribute);
               var replace_attr_value = mapAttrClass[attribute][attr_value_in_$el ?
                                                                attr_value_in_$el.toLowerCase() :
                                                                undefined];
               log.debug("attribute name, attribute value, mapping", attribute, attr_value_in_$el,
                        replace_attr_value);
               return [accu,
                       (attr_value_in_$el && replace_attr_value) ?
                       (attribute + "='" + replace_attr_value + "'") :
                       ""
               ].join(" ");
            }, "").trim();

            // read the tags map from mapTagClass -> array
            var html_class_tag = mapTagClass[tag_name];

            // make the corresponding html_text
            var html_class_text = (html_class_tag)
               ? [html_class_tag, html_class_attr].join(" ")
               : (html_class_attr ? " " + html_class_attr : "");

            html_begin_tag = "<" + tag_name + " id='" + node_index + "'" + html_class_text + ">";
         }

         aHTMLparsed.push(html_begin_tag);
         aHTMLtokens.push({type: 'html_begin_tag', text: html_begin_tag,
                             word_number: count_words(html_begin_tag), name: tag_name});
         // and commment it out
         comment_tag_out(html_begin_tag);

         node_index++;
         var aChildren = $el.contents();

         aChildren.each(function (index, el) {
            if (el.nodeType === 3) {
               // it is important to trim here to avoid variation in the number of token returned by split
               // according to the composition of the text
               // For instance "  <".split(" ").length !== "s <".split(" ").length (3 != 2)
               // This also means we are modifying the html source albeit only spaces, e.g. SIDE EFFECT!!
               // This could have impact maybe in verbatim source (pre tag for instance)
               // Hopefully in common application this will be without consequence
               var text = el.textContent;
               //text = flag_no_transform ? el.textContent : el.textContent;
               if (text.trim()) {
                  aHTMLparsed.push(text);
                  aHTMLtokens.push({type: 'text', text: text, word_number: count_words(text), name: ''});
                  comment_index += simple_tokenizer(text).length;
               }
            }
            else {
               _parseDOMtree($(el), aHTMLparsed, aHTMLtokens, aCommentPos, flag_no_transform);
            }
         });

         // Close the tag, we finished reading its content
         // EXCEPTION :BUG SOLUTION : if the tag is BR then don't put an end tag
         if (tag_name !== "BR") {
            var html_end_tag = "</" + $el.prop("tagName") + ">";
            aHTMLparsed.push(html_end_tag);
            aHTMLtokens.push({type: 'html_end_tag', text: html_end_tag,
                                word_number: count_words(html_end_tag), name: $el.prop("tagName")});
            // and don't forget to comment it out as to be skipped when highlighting
            comment_tag_out(html_end_tag);
         }
      }
   }

   function parseDOMtree_flatten_text_nodes(aHTMLTokens) {
      var aHTMLTokens_split = [];
      aHTMLTokens
         .forEach(function (html_token) {
                     switch (html_token.type) {
                        case 'html_begin_tag' :
                        case 'html_end_tag':
                           aHTMLTokens_split.push(html_token);
                           break;
                        case 'text':
                           html_token.text.split(" ").forEach(function (word) {
                              aHTMLTokens_split.push({type: 'text', text: word, word_number: word ? 1 : 0});
                           });
                           break;
                        default:
                           throw 'filter_selected_word: error, encountered an html_token with unknown type ' +
                                 html_token.type;
                           break;
                     }
                  });
      return aHTMLTokens_split;
   }

   //TEST CODE
   //window.inspect = inspect;
   ////////

   function getTargetID(ev) {
      return ev.target.getAttribute('id');
   }

   /**
    * Limitations :
    * - Works only in Chrome V8!!
    * - Also, it is evaluated at runtime, so it would not work for tracing purpose for example.
    * @return {string} the name of the immediately enclosing function in which this function is called
    */
   function get_calling_function_name(depth) {
      depth = depth || 3;
      var lines = /^ *at (.*)\(/.exec(Error("function_name").stack.split("\n")[depth]);
      if (lines) {
         return lines[1].trim();
      }
      else {
         return "";
      }
      // Another regexp should work for Firefox
      // Sample stack trace function s() {return Error("something").stack}
      // "s@debugger eval code:1:15
      // @debugger eval code:1:1
   }

   ////// Helper function DOM
   function some(arr, fun /*, thisArg*/) {

      if (this == null) {
         throw new TypeError('Array.prototype.some called on null or undefined');
      }

      if (typeof fun !== 'function') {
         throw new TypeError();
      }

      var len = arr.length;

      var thisArg = arguments.length >= 3 ? arguments[2] : void 0;
      for (var i = 0; i < len; i++) {
         if (i in arr && fun.call(thisArg, arr[i], i, arr)) {
            return true;
         }
      }

      return false;

   }

   /**
    * Return an event of name <i>event_name</i> with the properties set in objProp (shallow copy used)
    * @param event_name {String}
    * @param objProp {Object}
    * @returns {jQuery.Event}
    */
   function create_jquery_event(event_name, objProp) {
      return _extend(new $.Event(event_name), objProp);
   }

   /**
    *
    * @param start_node {Node}
    * @param end_node {Node}
    * @param type_comparison {string} string which indicates the type of comparison to be performed.
    *                                 === means using === to compare nodes.
    *                                 That means DOM tree traversal will stop when the exact node (same reference in memory)
    *                                 will be found.
    *                                 Any other value will use isEqualNode which compare node contents.
    *                                 Two nodes in different positions of the tree can not be differentiated
    * @returns {Array} array with the list of DOM nodes found while traversing the tree
    */
   function traverse_DOM_depth_first(type_comparison, start_node, /*optional*/ end_node) {
      if (typeof start_node.hasChildNodes !== 'function') {
         throw 'traverse_DOM_depth_first: expected a DOM node as parameter, received object start_node with no function hasChildNodes...'
      }
      if (end_node && typeof end_node.hasChildNodes !== 'function') {
         throw 'traverse_DOM_depth_first: expected a DOM node as parameter, received object end_node with no function hasChildNodes...'
      }
      var aDomNodes = [];
      _traverse_DOM_depth_first(start_node);
      return aDomNodes;

      //// Helper function
      function _traverse_DOM_depth_first(current_node) {
         aDomNodes.push(current_node);

         if (type_comparison === '===') {
            if (current_node === end_node) {
               return true;
            }
         }
         else {
            if (current_node.isEqualNode(end_node)) {
               return true;
            }
         }
         if (!current_node.hasChildNodes()) {
            return false;
         }
         else {
            return UT.some(current_node.childNodes, _traverse_DOM_depth_first);
         }
      }
   }

   /**
    * Return from a query string the number of parameters (defined as the highest x such as $x is in the query string)
    * @param qry_string
    * @returns {number}
    */
   function qry_count_num_param(qry_string) {
      //qry_count_num_param in utils through regexp $number, keep all of them and the highest
      // - important as count can be higher than the number of param
      var regExNumber = /(\$[0-9]+)/g;
      return +qry_string
         .split(regExNumber)
         .filter(function (str) {
                    return str.split(regExNumber).length == 3
                 })
         .reduce(function max_reduce(p, v) {
                    return ( p > v ? p : v );
                 })
         .slice(1);
      // TODO : finish testing
   }

   function sum(a, b) {
      return a + b
   }

   function min(a, b) {
      return a < b ? a : b
   }

   /**
    * Logical or. No type check on arguments type, return value forced to boolean. Please make sure you pass
    * the right type of arguments
    * @param a {boolean}
    * @param b {boolean}
    * @returns {boolean}
    */
   function or(a, b) {
      return !!(a || b)
   }

   /**
    * Purpose : returns the instanceof value for objects created through a constructor (new F()...)
    * @param {object} object object whose instanceof value is sought
    * @returns {string} Example getClass($("body")[0]) = "HTMLBodyElement"
    */
   function getClass(object) {
      if ('undefined' === typeof object) {
         return 'undefined';
      }
      else {
         return (Object.prototype.toString.call(object).slice(8, -1));
      }
   }

   function getInstanceOf(object) {
      // NOTE : that would fail in case of function /*asdas*/ name()
      return /function ([a-zA-Z0-9_$]+)/.exec(object.constructor.toString())[1];
   }

   function is_type_in_prototype_chain(object, type) {

      var curObj = object,
          inst_of,
          aTypes;

      if (typeof type !== 'string' && 'undefined' === typeof type.length) {
         // neither array nor string
         throw 'is_type_in_prototype_chain: wrong parameter type for parameter type: expected string or array'
      }
      aTypes = (typeof type === 'string') ? [type] : type;

      //check that object is of type object, otherwise it is a core type, which is out of scope
      // !! : null has type 'object' but is in no prototype chain
      if ('object' !== typeof object || object === null) {
         return false;
      }

      do {
         inst_of = getInstanceOf(Object.getPrototypeOf(curObj));
         curObj = Object.getPrototypeOf(curObj);
      }
      while (inst_of !== 'Object' && aTypes.indexOf(inst_of) === -1);
      return (aTypes.indexOf(inst_of) !== -1);
   }

   function filter_out_prop_by_type(obj, aProps) {
      //for instance: UT.filter_out_prop(appState, ['jQuery', 'Element']);
      // imagine appState has a big jQuery object in a property, we want to remove it
      for (var obj_prop in obj) {
         if (obj.hasOwnProperty(obj_prop)) {
            var current_value = obj[obj_prop];
            if (aProps.indexOf(UT.getClass(current_value)) > -1 ||
                UT.is_type_in_prototype_chain(current_value, aProps)) {
               delete obj[obj_prop];
            }
         }
      }
      return obj;
   }

   function filter_out_prop_by_key(obj, aKeys) {
      // aKeys is a list of keys that must not be found in the result object
      var result = {};
      Object.keys(obj).forEach(function (obj_key) {
         if (aKeys.indexOf(obj_key) == -1) {
            result[obj_key] = obj[obj_key]
         }
      });
      return result;
   }

   function get_prop(property) {
      return function (obj) {
         return obj[property];
      }
   }

   /**
    * Helper function used by assert_type (not exported)
    * @param {boolean} type_is_ok
    * @param property
    * @param actual_instanceof
    * @param expected_type
    * @param {boolean} is_proto_chain
    */
   function make_check_type_message(type_is_ok, property, actual_instanceof, expected_type, is_proto_chain) {
      return [
         type_is_ok ? 'OK:' : 'NOK:',
         'Parameter',
         property,
         'has type',
         actual_instanceof,
         is_proto_chain
            ? ['itself inheriting from type', expected_type].join(" ")
            : (type_is_ok ? "" : ['- expected type', expected_type].join(" "))
      ].join(" ");
   }

   /**
    * Purpose : checks type of a function arguments again a type specification.
    *           If so configured, throws an exception if one argument does not match its specification
    *           IMPORTANT NOTE : Does not work for type jQuery!!
    * @param argums {arguments} first parameter should always be arguments to pass the arguments of the calling function
    * @param aParamTypeSpecs {object}  array of object with the following spec :
    *                                  [ {param1: type_spec, param2: type_spec}, {param3: type_spec}, ... ]
    *                                  type_spec is :
    *                                  - defined js types : UT.type.[string|boolean|number|null|undefined...]
    *                                  - constructor types (checked with instanceof)
    *                                  - null : if the argument type check should be skipped
    *                                  - a finite number of previous options separated by |
    *                                    For instance :
    *                                    assert_type (arguments, [{aParamTypeSpecs: UT.type.array}, {$el: 'Element | null'}])
    *                                  NOTE: passing each argument spec in a separate array is safer, as there is
    *                                        no specification of the ordering in which properties of an object are
    *                                        retrieved. As of today however, and on chrome, the version with
    *                                        several spec in the same object works
    * @param options {object}  Optional properties :
    *                          - bool_no_exception if undefined or false -> throw an exception in case of error
    * @return {Object}         If no exception is to be thrown then returns an object with two properties:
    *                          - ok : true if all type checks are passed successfully, false otherwise
    *                          - results : array of result messages allowing to check result of the type check
    *                          OK: xxx -> spec fulfilled for param
    *                          NOK: xxx -> spec not fulfilled for param
    *                          undefined -> spec to skip type check of param
    *                          NOTE :
    *                          - the index in the result array corresponds to the index of the argument
    *                            being checked.
    * nice to have : flag to skip type checking altogether (for instance for production);
    * nice to have : parameter which allow to return just true or false i.e. no explanation messages (speed concern)
    */
   function assert_type(argums, aParamTypeSpecs, options) {
      // First check the arguments passed in parameters :-)
      var bool_no_exception,
          arity = arguments.length;
      if (arity !== 2 && arity !== 3) {
         throw 'assert_type: expecting 2 or 3 arguments, received ' + arity;
      }
      if (options) {
         bool_no_exception = options.bool_no_exception;
         if (bool_no_exception && 'boolean' !== typeof bool_no_exception) {
            throw 'assert_type: expected optional argument bool_no_exception to be boolean, received type ' + typeof bool_no_exception;
         }
      }
      if (!argums) {
         throw 'assert_type: expecting argument argums, received falsy value';
      }
      if (!aParamTypeSpecs) {
         throw 'assert_type: expecting argument aParamTypeSpecs, received falsy value';
      }
      if (aParamTypeSpecs && !aParamTypeSpecs.length) {
         throw 'assert_type: expecting array argument aParamTypeSpecs, received ' + typeof aParamTypeSpecs;
      }

      // Get the arguments whose type is to be checked as an array
      var aArgs = slice.call(argums),
          aCheckResults = {},
          param_index = 0, //1 is starting index to skip arguments
          err;

      aParamTypeSpecs.forEach(function (paramTypeSpec) {
         // paramTypeSpec is similar to {param1: type_spec}
         // aArgs[param_index] will be the argument number index passed as parameter
         var aProps = Object.keys(paramTypeSpec);
         if (aProps.length === 0) {
            throw 'assert_type: expected non-empty spec object!';
         }

         // per API spec, there should only be one property but we allow for more
         // It is safer to use only one property per object
         // because different browsers order differently the enumeration of object properties
         // For instance, Chrome lists numerical properties first, and then the rest in order of declaration
         // It should still work in any case, as we use strings and not numbers as values of the properties,
         // so order should be kept. There is however no guarantee that this will always be the case in the future
         aCheckResults = aProps.map(
            function (property) {
               var expected_type = paramTypeSpec[property];
               // this should be a string
               var current_param = aArgs[param_index++];
               // edge cases of null and undefined value for params are dealth with in getClass
               // which turns them into normal cases
               // normal cases, first check expected_type is a string or an array
               var aExpected_type = undefined;
               if (expected_type !== null) {
                  // an expected type of null means : do not check type for this argument
                  // this allows to skip type checking of some arguments which have to be part of the specs
                  // to keep the ordering of later arguments
                  if ('string' === typeof expected_type) {
                     aExpected_type = [expected_type];
                  }
                  else if ('undefined' !== typeof expected_type[0]) {//probably an array
                     aExpected_type = expected_type;
                  }
                  else {
                     throw 'assert_type: expected a string or array representing the instanceof value(s). Received type ' + typeof expected_type;
                  }
               }

               if (aExpected_type) {// if expected_type is null we skip the type checking for that parameter
                  var is_proto_chain = undefined,
                      exp_index = undefined,
                      actual_instanceof = getClass(current_param);
                  var type_is_ok = aExpected_type
                     .map(function (expected_type, index) {
                             return (expected_type === actual_instanceof
                                || (is_type_in_prototype_chain(current_param, expected_type) &&
                                    (is_proto_chain = true) && !!(exp_index = index + 1)));
                             // different hacks here to avoid doing it on a separate line
                          })
                     .reduce(or, false);
                  if (!type_is_ok) {
                     // one failure to check is enough
                     err = true;
                  }
                  return make_check_type_message(type_is_ok, property, actual_instanceof,
                                                 exp_index ? aExpected_type[exp_index - 1] : expected_type,
                                                 is_proto_chain);
               }
            }
         );
      });

      // throws an exception if undefined or false
      if (!bool_no_exception && err) {
         throw 'assert_type: TYPE ERROR!\n' + aCheckResults.join("\n");
      }
      else {
         return {
            ok: !err,
            results: aCheckResults
         };
      }
   }

   function assert_properties(obj, specMap, options) {
      //specMap :: {prop1: 'type1 | type2', prop2: 'type1 | type2', etc.};
      // First check that all properties exist
      // Note : if one do not want to check a property it is enough not to include it in the specMap
      //        so it is assumed that all specified properties must be DEFINED (can have falsy values)

      // validating inputs and setting key variables
      var err = false,
          bool_no_exception;
      var argCheck = assert_type(arguments, [
         {obj: 'Object', specMap: 'Object'}
      ], {bool_no_exception: true});
      if (argCheck.ok) {
         var aProps = Object.keys(specMap);
         if (aProps.length === 0) {
            throw 'assert_properties: expected non-empty spec object!';
         }
         if (options) {
            bool_no_exception = options.bool_no_exception;
            if (bool_no_exception && 'boolean' !== typeof bool_no_exception) {
               throw 'assert_properties: expected optional argument bool_no_exception to be boolean, received type ' + typeof bool_no_exception;
            }
         }

         // Actual property type checking
         var aCheckResults = aProps.map(function (property) {
            // check obj.property is defined && type(obj.property) in type(specMap.property)
            var curr_obj_prop = obj[property];
            var curr_prop_spec = specMap[property];
            if ('undefined' !== typeof curr_obj_prop) {
               var curr_obj_prop_spec = {};
               curr_obj_prop_spec[property] = curr_prop_spec;
               var propCheck = assert_type([curr_obj_prop], [curr_obj_prop_spec], {bool_no_exception: true});
               err = err || !propCheck.ok;
               return propCheck.results[0];
            }
            else {
               // obj[property] is undefined
               err = true;
               return ['property', property, 'is undefined in object'].join(" ");
            }
         });

         aCheckResults.unshift('calling function: ' + get_calling_function_name(4));

         // throws an exception if undefined or false
         if (!bool_no_exception && err) {
            throw 'assert_properties: ERROR!\n' + aCheckResults.join("\n");
         }
         else {
            return {
               ok: !err,
               results: aCheckResults
            };
         }
      }
      else {
         argCheck.results.unshift('calling function: ' + get_calling_function_name(4));
         throw 'assert_properties: ERROR!\n' + argCheck.results.join("\n");
      }
   }

   function log_error(fn_name/*,  arguments */) {
      var args = slice.call(arguments);
      if (args.length < 2) {
         throw 'log_error: called with less parameters than expected, expected at least 2, passed ' +
               args.length;
      }
      else {
         args.shift();
         var message = args.join(" ");
         // TODO : add a CONFIG flag to allow for silent failure or not logging in console
         log.error(message);
         throw message;
      }
   }

   //Helper function - error handling in promises
   // a priori useless function for node callback, just use callback directly instead
   function error_handler(callback) {
      return function failure(err) {
         callback(err.toString(), null);
      }
   }

   function basic_error_handler(err) {
      throw err;
   }

   /**
    * This is to bridge promise and node-style callbacks. The promise returns always one argument
    * which is in second position in node-style callback
    * @param callback
    * @returns {Function}
    */
   function callback_ok(callback) {
      return function call_callback(result) {
         callback(null, result);
      }
   }

   function disaggregate_input(sWords) {
      /* for now, just takes a string and returns an array of word tokens
       Consecutive spaces are reduced to one
       Trailing and leading spaces signs are taken out
       That includes characters such as \n \r, etc. anything considered spaces by regexp
       puntuation signs are isolated
       Tested on czech, french and english language characters
       */
      // temp.sql: return clean_text(sWords).split(" ");
      return sWords.replace(/[^\u00C0-\u1FFF\u2C00-\uD7FF\w\s]|_/g, function ($1) {
         return ' ' + $1 + ' ';
      }).replace(/\s+/g, ' ').trim().split(' ');
   }

   function identity(token) {
      return token;
   }

   function f_none() {
      // the empty function - used when there is no action to perform in a callback context
   }

   function default_node_callback(resolve, reject) {
      return function (err, result) {
         if (err) {
            reject(err);
         }
         else {
            resolve(result);
         }
      }
   }

   ///Helper notes function
   function count_word(word) {
      return word ? 1 : 0;
   }

   /**
    * will be false if word="", true otherwise
    * @param word {String}
    * @returns {String}
    */
   function is_word(word) {
      return word;
   }

   var _unaccent_letter_map = null; // null if not initialized yet -- lazy initialization
   function unaccent_letter(letter) {
      var defaultDiacriticsRemovalMap;

      if (!letter || !letter.length || letter.length > 1) {
         throw 'unaccent_letter: called with falsy or wrong parameter letter : ' + letter;
      }

      if (!_unaccent_letter_map) {
         _unaccent_letter_map = {};
         // initialize diacritics mapping
         defaultDiacriticsRemovalMap = [
            {'base': 'A', 'letters': '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
            {'base': 'AA', 'letters': '\uA732'},
            {'base': 'AE', 'letters': '\u00C6\u01FC\u01E2'},
            {'base': 'AO', 'letters': '\uA734'},
            {'base': 'AU', 'letters': '\uA736'},
            {'base': 'AV', 'letters': '\uA738\uA73A'},
            {'base': 'AY', 'letters': '\uA73C'},
            {'base': 'B', 'letters': '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'},
            {'base': 'C', 'letters': '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'},
            {'base': 'D', 'letters': '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779'},
            {'base': 'DZ', 'letters': '\u01F1\u01C4'},
            {'base': 'Dz', 'letters': '\u01F2\u01C5'},
            {'base': 'E', 'letters': '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
            {'base': 'F', 'letters': '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'},
            {'base': 'G', 'letters': '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'},
            {'base': 'H', 'letters': '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'},
            {'base': 'I', 'letters': '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
            {'base': 'J', 'letters': '\u004A\u24BF\uFF2A\u0134\u0248'},
            {'base': 'K', 'letters': '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'},
            {'base': 'L', 'letters': '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'},
            {'base': 'LJ', 'letters': '\u01C7'},
            {'base': 'Lj', 'letters': '\u01C8'},
            {'base': 'M', 'letters': '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'},
            {'base': 'N', 'letters': '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'},
            {'base': 'NJ', 'letters': '\u01CA'},
            {'base': 'Nj', 'letters': '\u01CB'},
            {'base': 'O', 'letters': '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
            {'base': 'OI', 'letters': '\u01A2'},
            {'base': 'OO', 'letters': '\uA74E'},
            {'base': 'OU', 'letters': '\u0222'},
            {'base': 'P', 'letters': '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'},
            {'base': 'Q', 'letters': '\u0051\u24C6\uFF31\uA756\uA758\u024A'},
            {'base': 'R', 'letters': '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'},
            {'base': 'S', 'letters': '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'},
            {'base': 'T', 'letters': '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'},
            {'base': 'TZ', 'letters': '\uA728'},
            {'base': 'U', 'letters': '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
            {'base': 'V', 'letters': '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'},
            {'base': 'VY', 'letters': '\uA760'},
            {'base': 'W', 'letters': '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'},
            {'base': 'X', 'letters': '\u0058\u24CD\uFF38\u1E8A\u1E8C'},
            {'base': 'Y', 'letters': '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'},
            {'base': 'Z', 'letters': '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'},
            {'base': 'a', 'letters': '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
            {'base': 'aa', 'letters': '\uA733'},
            {'base': 'ae', 'letters': '\u00E6\u01FD\u01E3'},
            {'base': 'ao', 'letters': '\uA735'},
            {'base': 'au', 'letters': '\uA737'},
            {'base': 'av', 'letters': '\uA739\uA73B'},
            {'base': 'ay', 'letters': '\uA73D'},
            {'base': 'b', 'letters': '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
            {'base': 'c', 'letters': '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
            {'base': 'd', 'letters': '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
            {'base': 'dz', 'letters': '\u01F3\u01C6'},
            {'base': 'e', 'letters': '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
            {'base': 'f', 'letters': '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
            {'base': 'g', 'letters': '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
            {'base': 'h', 'letters': '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
            {'base': 'hv', 'letters': '\u0195'},
            {'base': 'i', 'letters': '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
            {'base': 'j', 'letters': '\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
            {'base': 'k', 'letters': '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
            {'base': 'l', 'letters': '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
            {'base': 'lj', 'letters': '\u01C9'},
            {'base': 'm', 'letters': '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
            {'base': 'n', 'letters': '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
            {'base': 'nj', 'letters': '\u01CC'},
            {'base': 'o', 'letters': '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
            {'base': 'oi', 'letters': '\u01A3'},
            {'base': 'ou', 'letters': '\u0223'},
            {'base': 'oo', 'letters': '\uA74F'},
            {'base': 'p', 'letters': '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
            {'base': 'q', 'letters': '\u0071\u24E0\uFF51\u024B\uA757\uA759'},
            {'base': 'r', 'letters': '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
            {'base': 's', 'letters': '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
            {'base': 't', 'letters': '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
            {'base': 'tz', 'letters': '\uA729'},
            {'base': 'u', 'letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'},
            {'base': 'v', 'letters': '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
            {'base': 'vy', 'letters': '\uA761'},
            {'base': 'w', 'letters': '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
            {'base': 'x', 'letters': '\u0078\u24E7\uFF58\u1E8B\u1E8D'},
            {'base': 'y', 'letters': '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
            {'base': 'z', 'letters': '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}
         ];

         defaultDiacriticsRemovalMap.forEach(function (diacritic_map) {
            diacritic_map.letters.split('').forEach(function (diacritic_letter) {
               _unaccent_letter_map[diacritic_letter] = diacritic_map.base;
            })
         })
      }

      return _unaccent_letter_map[letter];
   }

   function startsWith(str, startStr) {
      return str.lastIndexOf(startStr, 0) === 0
   }

   /**
    * Source : http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
    * The Levenshtein distance is a string metric for measuring the difference between two sequences. Informally, the Levenshtein distance between two words is the minimum number of single-character edits (i.e. insertions, deletions or substitutions) required to change one word into the other
    * Computes the Levenshtein distance between two strings
    * Ex:
    * > getEditDistance ("Bruno", "Burnal")
    * 4
    * > getEditDistance ("uživat", "užit")
    * 2
    * > getEditDistance ("uživat", "uživat")
    * 0
    * > getEditDistance ("last", "same")
    * 3
    * @param a {String}
    * @param b {String}
    * @returns {Number}
    */
   function getEditDistance(a, b) {
      if (a.length === 0) {
         return b.length;
      }
      if (b.length === 0) {
         return a.length;
      }

      var matrix = [];

      // increment along the first column of each row
      var i;
      for (i = 0; i <= b.length; i++) {
         matrix[i] = [i];
      }

      // increment each column in the first row
      var j;
      for (j = 0; j <= a.length; j++) {
         matrix[0][j] = j;
      }

      // Fill in the rest of the matrix
      for (i = 1; i <= b.length; i++) {
         for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
               matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
               matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                                       Math.min(matrix[i][j - 1] + 1, // insertion
                                                matrix[i - 1][j] + 1)); // deletion
            }
         }
      }

      return matrix[b.length][a.length];
   };

   /**
    * Returns a rejected promise which can be used to pass down a chain of promises and be caught down the road
    * skipping the normal processing of intermediate non-catching then calls
    * @param message {String} Error message to pass in the promise
    * @returns {RSVP.Promise}
    */
   function delegate_promise_error(message) {
      return new RSVP.Promise(function (resolve, reject) {
         reject(message);
      })
   }

   var _UT =
       {
          ERROR_CHANNEL: 'ERROR',
          isArray: isArray,
          trimInput: trimInput,
          isNotEmpty: isNotEmpty,
          isRegExp: isRegExp,
          isDate: isDate,
          isError: isError,
          timestamp: timestamp,
          inherits: inherits,
          _extend: _extend,
          isString: isString,
          isPunct: isPunct,
          isFunction: isFunction,
          isPromise: isPromise,
          sPrintf: String.format,
          disaggregate_input: disaggregate_input,
          timeStamp: timeStamp,
          isNumberString: isNumberString,
          async_cached: async_cached,
          OutputStore: OutputStore,
          getIndexInArray: getIndexInArray,
          escape_html: escape_html,
          remove_extra_spaces: remove_extra_spaces,
          remove_punct: remove_punct,
          wrap_string: wrap_string,
          split_xpath: split_xpath,
          traverse_dir_xpath: traverse_dir_xpath,
          padding_left: padding_left,
          padding_right: padding_right,
          fragmentFromString: fragmentFromString,
          injectArray: injectArray,
          get_calling_function_name: get_calling_function_name,
          parseDOMtree: parseDOMtree,
          separate_obj_prop: separate_obj_prop,
          some: some,
          traverse_DOM_depth_first: traverse_DOM_depth_first,
          create_jquery_event: create_jquery_event,
          fn_get_prop: fn_get_prop,
          fn_get_public_props: fn_get_public_props,
          fn_not: fn_not,
          apply_to_props: apply_to_props,
          parseDOMtree_flatten_text_nodes: parseDOMtree_flatten_text_nodes,
          getTargetID: getTargetID,
          getClass: getClass,
          assert_type: assert_type,
          assert_properties: assert_properties,
          is_type_in_prototype_chain: is_type_in_prototype_chain,
          getInstanceOf: getInstanceOf,
          filter_out_prop_by_type: filter_out_prop_by_type,
          filter_out_prop_by_key: filter_out_prop_by_key,
          get_prop: get_prop,
          slice: slice,
          log_error: log_error,
          qry_count_num_param: qry_count_num_param,
          sum: sum,
          min: min,
          or: or,
          identity: identity,
          f_none: f_none,
          count_word: count_word,
          is_word: is_word,
          unaccent_letter: unaccent_letter,
          startsWith: startsWith,
          getEditDistance: getEditDistance,
          delegate_promise_error: delegate_promise_error,
          error_handler: error_handler,
          basic_error_handler: basic_error_handler,
          callback_ok: callback_ok,
          default_node_callback: default_node_callback,
          parsedToken_count_tag: parsedToken_count_tag
       };

   _UT.type = {
      string: 'String', array: 'Array', function: 'Function',
      number: 'Number', boolean: 'Boolean', object: 'Object',
      null: 'Null', undefined: 'undefined'
   };

   if ('undefined' !== typeof window) {
      window.UT = _UT;
   }
   return _UT;
}

(function (name, definition, context, dependencies) {
   if (typeof module !== 'undefined' && module.exports) {
     var req_dep = [require('./debug'), require('rsvp')];
       // var req_dep = dependencies ? dependencies.map(require) : [];
      //RSVP = require('rsvp');
      module.exports = definition.apply(context, req_dep);
   }
   else if (typeof define === 'function' && define.amd) {
      define(name, (dependencies || []), definition);
   }
   else {
      context[name] = definition.apply(context);
   }
})('utils', utilsFactory, this, ['debug', 'rsvp']);
