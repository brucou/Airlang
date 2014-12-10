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

function utilsFactory () {
   Array.prototype.isItArray = true;

   var slice = Array.prototype.slice;

   var rePUNCT = /[ \,\.\$\uFFE5\^\+=`~<>{}\[\]|\u3000-\u303F!-#%-\x2A,-\/:;\x3F@\x5B-\x5D_\x7B}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]+/g;

   function getIndexInArray ( aArray, field_to_search, value ) {
      var i, iIndex = -1;
      for (i = 0; i < aArray.length; i++) {
         if (aArray[i][field_to_search] === value) {
            iIndex = i;
            break;
         }
      }
      return iIndex;
   }

   function isArray ( ar ) {
      return Array.isArray(ar) || (typeof ar === 'object' && objectToString(ar) === '[object Array]');
   }

   function async_cached ( f, initialCache ) {
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
       The OutputStore functionality equals to that of a stream. Each character arrival (value) provokes
       a read action (function call), when the end is reached (countDown) the gathered charactered are passed to a function
       (propagateResult)
       @param f: the function to be applied. f takes an object and output another one
       @param initial_cache : a specific cache implemention OR if none, an array of valueMap object which are simply couples (x,y) where y=f(x), OR []
       */
      // nice to have : redesign the outputstore function to detect end of stream instead of having a fixed countdown

      // Default implementation of CachedValues is an array, it needs to be able to have property through CachedValues[prop] = value
      var cvCachedValues;
      var self = this;

      if (initialCache && isArray(initialCache)) {
         // give the possibility to initialize the cachedvalues cache object with an array, it is easier
         cvCachedValues = new CachedValues(initialCache);
      }
      else if (!initialCache) {//no cache passed as parameter
         logWrite(DBG.TAG.INFO, "async function will not be cached");
      }
      else {
         cvCachedValues = initialCache; // if a cache is passed in parameter then use that one
      }

      var async_cached_f = function cached_fn ( value, osStore ) {
         // could be refactored to separate functionality of OutputStore which is that of a stream buffer
         // it piles on values till a trigger (similar to "end" of stream) is detected, then a callback ensues
         // if OutputStore is a function, then it is considered to be the callback function with default values for OutputStore structure

         logEntry("async_cached_f");

         //var dfr = $.Deferred(); // promise passed to OS structure for resolving the data at relevant time

         if (isFunction(osStore)) {
            var f_callback = osStore;
            osStore = new OutputStore({countdown : 1, callback : f_callback});
         }
         //osStore.setDeferred(dfr);
         var index = osStore.push(["Input value", value].join(": ")); // this is in order to "book" a place in the output array to minimize chances that a concurrent exec does not take it
         // index points at the temporary value;

         var fvalue = null;
         // TODO : !! also applies to "", check that
         //logWrite(DBG.TAG.DEBUG, "cvCachedValues", inspect(cvCachedValues));
         if (cvCachedValues) { // if function is cached
            var fValue = cvCachedValues.getItem(value);
            if (fValue) {
               // value already cached, no callback, no execution, just assigning the value to the output array
               logWrite(DBG.TAG.DEBUG, "Computation for value already in cache!", inspect(value),
                        inspect(fValue));
               updateOutputStore(osStore, index, fValue);
               //fvalue = aValue;
            }
            else { // not in cache so cache it, except if it is a number
               exec_f();
               cvCachedValues.setItem(value, fvalue);
            }
         }
         else {// if function is not cached
            //logWrite(DBG.TAG.INFO, "function is not cached so just executing it");
            exec_f();
         }

         logExit("async_cached_f");
         return fvalue;

         function exec_f () {
            fvalue = f(value, callback);
            osStore.setValueAt(index, osStore.getValueAt[index] + " | async call to f returns : " + fvalue);
            logWrite(DBG.TAG.INFO, "New async computation, logging value immediately returned by func", value,
                     fvalue);
         }

         function updateOutputStore ( osOutputStore, iIndex, aaValue ) {
            osOutputStore.setValueAt(iIndex, aaValue);
            osOutputStore.invalidateAt(iIndex); // This is to propagate the change elsewhere who registered for an action to be taken
         }

         function callback ( err, result ) {
            logEntry("async cached callback");
            if (cvCachedValues) {
               if (!(err)) {
                  cvCachedValues.setItem(value, result);
               }
               else {
                  cvCachedValues.setItem(value, null);
               }
            }
            if (err) {
               logWrite(DBG.TAG.ERROR, "error while executing async query on server", err);
               console.log(err);
               dfr.reject(err);
               osStore.setErr(err);
               osStore.invalidateAt(index);
            }
            else {
               updateOutputStore(osStore, index, result);
            }
            logExit("async cached callback");
         }
      };
      //!! this is not a standard function, only used for tracing purposes on Chrome
      async_cached_f.displayName = f.name;

      async_cached_f.cache = cvCachedValues;
      async_cached_f.f = f; // giving a way to return to the original uncached version of f)
      //f.async_cached_f = async_cached_f;

      return async_cached_f;
   }

   function trimInput ( value ) {
      return value.replace(/^\s*|\s*$/g, '');
   }

   function isNotEmpty ( value ) {
      if (value && value !== '') {
         return true;
      }
   }

   function isEmail ( value ) {
      var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (filter.test(value)) {
         return true;
      }
   }

   function stylizeNoColor ( str, styleType ) {
      return str;
   }

   function stylizeWithColor ( str, styleType ) {
      var style = inspect.styles[styleType];

      if (style) {
         return '\u001b[' + inspect.colors[style][0] + 'm' + str + '\u001b[' + inspect.colors[style][1] + 'm';
      }
      else {
         return str;
      }
   }

   /**
    * Echos the value of a value. Trys to print the value out
    * in the best way possible given the different types.
    *
    * @param {Object} obj The object to print out.
    * @param {Object} opts Optional options object that alters the output.
    */
   /* legacy: obj, showHidden, depth, colors
    * The first required argument is the object, the second optional argument is
    whether to display the non-enumerable properties, the  third optional argument is the number of times the
    object is recursed (depth), and the fourth, also optional, is whether to style the output in ANSI colors.
    */
   function inspect ( obj, opts ) {
      // TAKEN FROM NODE
      // default options
      var ctx = {
         seen    : [],
         stylize : stylizeNoColor
      };
      // legacy...
      if (arguments.length >= 3) {
         ctx.depth = arguments[2];
      }
      if (arguments.length >= 4) {
         ctx.colors = arguments[3];
      }
      if (typeof opts === 'boolean') {
         // legacy...
         ctx.showHidden = opts;
      }
      else if (opts) {
         // got an "options" object
         exports._extend(ctx, opts);
      }
      // set default options
      if (typeof ctx.showHidden === 'undefined') {
         ctx.showHidden = false;
      }
      if (typeof ctx.depth === 'undefined') {
         ctx.depth = 2;
      }
      if (typeof ctx.colors === 'undefined') {
         ctx.colors = false;
      }
      if (typeof ctx.customInspect === 'undefined') {
         ctx.customInspect = true;
      }
      if (ctx.colors) {
         ctx.stylize = stylizeWithColor;
      }
      return formatValue(ctx, obj, ctx.depth);
   }

   function formatValue ( ctx, value, recurseTimes ) {
      // Provide a hook for user-specified inspect functions.
      // Check that value is an object with an inspect function on it
      if (ctx.customInspect && value && typeof value.inspect === 'function' && // Filter out the util module, it's inspect function is special
          value.inspect !== exports.inspect && // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
         return String(value.inspect(recurseTimes));
      }

      // Primitive types cannot have properties
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
         return primitive;
      }

      // Look up the keys of the object.
      var keys = Object.keys(value);
      var visibleKeys = arrayToHash(keys);

      if (ctx.showHidden) {
         keys = Object.getOwnPropertyNames(value);
      }

      // Some type of object without properties can be shortcutted.
      if (keys.length === 0) {
         if (typeof value === 'function') {
            var name = value.name ? ': ' + value.name : '';
            return ctx.stylize('[Function' + name + ']', 'special');
         }
         if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
         }
         if (isDate(value)) {
            return ctx.stylize(Date.prototype.toString.call(value), 'date');
         }
         if (isError(value)) {
            return formatError(value);
         }
      }

      var base = '', array = false, braces = ['{', '}'];

      // Make Array say that they are Array
      if (isArray(value)) {
         array = true;
         braces = ['[', ']'];
      }

      // Make functions say that they are functions
      if (typeof value === 'function') {
         var n = value.name ? ': ' + value.name : '';
         base = ' [Function' + n + ']';
      }

      // Make RegExps say that they are RegExps
      if (isRegExp(value)) {
         base = ' ' + RegExp.prototype.toString.call(value);
      }

      // Make dates with properties first say the date
      if (isDate(value)) {
         base = ' ' + Date.prototype.toUTCString.call(value);
      }

      // Make error with message first say the error
      if (isError(value)) {
         base = ' ' + formatError(value);
      }

      if (keys.length === 0 && (!array || value.length == 0)) {
         return braces[0] + base + braces[1];
      }

      if (recurseTimes < 0) {
         if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
         }
         else {
            return ctx.stylize('[Object]', 'special');
         }
      }

      ctx.seen.push(value);

      var output;
      if (array) {
         output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      }
      else {
         output = keys.map(function ( key ) {
            return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
         });
      }

      ctx.seen.pop();

      return reduceToSingleString(output, base, braces);
   }

   function arrayToHash ( array ) {
      var hash = {};

      array.forEach(function ( val, idx ) {
         hash[val] = true;
      });

      return hash;
   }

   function injectArray ( aSource, aToInject, pos ) {
      return aSource.splice.apply(aSource, [pos, 0].concat(aToInject));
   }

   function isRegExp ( re ) {
      return typeof re === 'object' && objectToString(re) === '[object RegExp]';
   }

   function isFunction ( object ) {

      return !!(object && typeof object.constructor !== "undefined" && typeof object.call !== "undefined" &&
                typeof object.apply !== "undefined");

      // return typeof obj === 'function' && toString.call(obj) == '[object Function]';
      // this is a more precise version but slower
   }

   function isString ( obj ) {
      return obj && (typeof teststring === "string");
      // return obj && toString.call(obj) == '[object String]';
      // this is a more precise version but slower
   }

   function isPunct ( char ) {
      // return true if the character char is a punctuation sign
      // TODO: improve to adjust list of punctuation by language
      if (char.length > 1) {
         return null;
      }
      else {
         return (rePUNCT.exec(char));
      }
   }

   function isDate ( d ) {
      return typeof d === 'object' && objectToString(d) === '[object Date]';
   }

   function isError ( e ) {
      return typeof e === 'object' && objectToString(e) === '[object Error]';
   }

   function formatPrimitive ( ctx, value ) {
      switch (typeof value) {
         case 'undefined':
            return ctx.stylize('undefined', 'undefined');

         case 'string':
            var simple = '\'' +
                         JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') +
                         '\'';
            return ctx.stylize(simple, 'string');

         case 'number':
            return ctx.stylize('' + value, 'number');

         case 'boolean':
            return ctx.stylize('' + value, 'boolean');
      }
      // For some reason typeof null is "object", so special case here.
      if (value === null) {
         return ctx.stylize('null', 'null');
      }
   }

   function formatError ( value ) {
      return '[' + Error.prototype.toString.call(value) + ']';
   }

   function formatArray ( ctx, value, recurseTimes, visibleKeys, keys ) {
      var output = [];
      for (var i = 0, l = value.length; i < l; ++i) {
         if (hasOwnProperty(value, String(i))) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
         }
         else {
            output.push('');
         }
      }
      keys.forEach(function ( key ) {
         if (!key.match(/^\d+$/)) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
         }
      });
      return output;
   }

   function formatProperty ( ctx, value, recurseTimes, visibleKeys, key, array ) {
      var name, str, desc;
      desc = Object.getOwnPropertyDescriptor(value, key) || { value : value[key] };
      if (desc.get) {
         if (desc.set) {
            str = ctx.stylize('[Getter/Setter]', 'special');
         }
         else {
            str = ctx.stylize('[Getter]', 'special');
         }
      }
      else {
         if (desc.set) {
            str = ctx.stylize('[Setter]', 'special');
         }
      }
      if (!hasOwnProperty(visibleKeys, key)) {
         name = '[' + key + ']';
      }
      if (!str) {
         if (ctx.seen.indexOf(desc.value) < 0) {
            if (recurseTimes === null) {
               str = formatValue(ctx, desc.value, null);
            }
            else {
               str = formatValue(ctx, desc.value, recurseTimes - 1);
            }
            if (str.indexOf('\n') > -1) {
               if (array) {
                  str = str.split('\n').map(function ( line ) {
                     return '  ' + line;
                  }).join('\n').substr(2);
               }
               else {
                  str = '\n' + str.split('\n').map(function ( line ) {
                     return '   ' + line;
                  }).join('\n');
               }
            }
         }
         else {
            str = ctx.stylize('[Circular]', 'special');
         }
      }
      if (typeof name === 'undefined') {
         if (array && key.match(/^\d+$/)) {
            return str;
         }
         name = JSON.stringify('' + key);
         if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.substr(1, name.length - 2);
            name = ctx.stylize(name, 'name');
         }
         else {
            name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
            name = ctx.stylize(name, 'string');
         }
      }

      return name + ': ' + str;
   }

   function reduceToSingleString ( output, base, braces ) {
      var numLinesEst = 0;
      var length = output.reduce(function ( prev, cur ) {
         numLinesEst++;
         if (cur.indexOf('\n') >= 0) {
            numLinesEst++;
         }
         return prev + cur.length + 1;
      }, 0);

      if (length > 60) {
         return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
      }

      return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
   }

   function objectToString ( o ) {
      return Object.prototype.toString.call(o);
   }

   function timestamp () {
      var d = new Date();
      var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
      return [d.getDate(), months[d.getMonth()], time].join(' ');
   }

   function inherits ( ctor, superCtor ) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
         constructor : {
            value        : ctor,
            enumerable   : false,
            writable     : true,
            configurable : true
         }
      });
   };

   function _extend ( origin, add ) {
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
   };

   // definition of helper function format, similar to sprintf of C
   // usage : String.format('{0} is dead, but {1} is alive! {0} {2}', 'ASP', 'ASP.NET');
   // result : ASP is dead, but ASP.NET is alive! ASP {2}

   if (!String.format) {
      String.format = function ( format ) {
         var args = slice.call(arguments, 1);
         return format.replace(/{(\d+)}/g, function ( match, number ) {
            return typeof args[number] != 'undefined' ? args[number] : match;
         });
      };
   }

   /**
    * Return a timestamp with the format "m/d/yy h:MM:ss TT"
    * @type {Date}
    */
   function timeStamp () {
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

   function isNumberString ( text ) {
      // issue: isNaN recognizes english formatting of numbers only
      return !isNaN(text);
   }

   function CachedValues ( arrayInit ) {
      // constructor
      /* We are taking advantage here of the native hashmap implementation of javascript (search in O(1))
       On the down side, we might loose some efficiency in terms of storage, as each hash is a full-fledged new object.
       NOTE: keys can be any valid javascript string: cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
       NOTE: it is preferable to have keys trimmed and removed extra spaces to avoid unexpected or confusing results
       However indexedDB currently has an asynchronous API, which makes it difficult to use in connection with
       synchronous functions
       */
      self = this;
      this.internalStore = {};
      this.secondaryStore = [];
      this.jsObjectInternals =
      ["__proto__", "__noSuchMethod__", "__count__", "__parent__", "__defineGetter__", "__defineSetter__",
       "__lookupGetter__", "__lookupSetter__", "hasOwnProperty", "constructor", "isPrototypeOf",
       "propertyIsEnumerable",
       "toLocaleString", "toString", "valueOf"
         /* , "toSource", "eval", "watch", "unwatch" // not in js core anymore */
      ]; // this is the list of the function that cannot be used as keys in an object as they are already reserved
      this.jsOI_length = this.jsObjectInternals.length;

      this.getItem = function ( key ) {
         // return the fvalue if there, otherwise return false
         // be careful that fvalue not be a boolean otherwise it could conflict
         var isVinC = this.isValueInCache(key);
         if (isVinC.bool) {
            // that should be the normal case if that function is called
            var isRes = this.isReservedKey(key);
            if (isRes.bool) {
               // in secondary store
               return this.secondaryStore[isRes.index];
            }
            else {
               // in primary store
               return this.internalStore[key];
            }
         }
         else {
            // the function was called but nothing was found in cache!!
            return null;
         }
      };
      this.setItem = function ( key, fvalue ) {
         // check that the key is not already in the cache, if it is replace current by the new fvalue
         // e.g. cache is a indexed set
         // so we have a new row, or an update row operation here
         // returns false if error, true if operation was successful
         logEntry("putValueInCache");
         logWrite(DBG.TAG.DEBUG, "isValueInCache", inspect(this.isValueInCache(key).bool));
         if (this.isValueInCache(key).bool) {
            logWrite(DBG.TAG.DEBUG, "calling updateValueInCache", key, fvalue);
            logExit("putValueInCache");
            return this.updateValueInCache(key, fvalue);
         }
         else {
            // not in cache, add it
            // but add it where?
            var isRes = this.isReservedKey(key);
            logWrite(DBG.TAG.DEBUG, "not in cache");
            logWrite(DBG.TAG.DEBUG, "isReservedKey?", isRes.bool, isRes.index);
            if (isRes.bool) {
               logWrite(DBG.TAG.DEBUG, "adding to secondary Store");
               this.secondaryStore[isRes.index] = fvalue;
               logExit("putValueInCache");
               return true;
            }
            else {
               // add it to the internal store
               logWrite(DBG.TAG.DEBUG, "adding to internal store");
               this.internalStore[key] = fvalue;
               logExit("putValueInCache");
               return true;
            }
         }
      };

      this.isValueInCache = function ( key ) {
         // returns true if the key passed in parameter is already in the cache
         // first, test if the key is one of the reserved keys, because it will always match is applied to any object
         var isRes = this.isReservedKey(key);
         if (isRes.bool) {
            // the key is one of the reserved properties, look up the secondary store
            if (this.secondaryStore[isRes.index]) {
               return {isInternalStore : false, bool : true};
            }
            else {
               return {isInternalStore : false, bool : false};
            }
         }
         if (!!this.internalStore[key]) {
            // key is already cached
            return {isInternalStore : true, bool : true};
         }
         return {isInternalStore : true, bool : false};
      };

      this.updateValueInCache = function ( key, fvalue ) {
         // updates the value referenced by key in the cache
         // returns false if error, true if operation was successful
         // NOTE : this is an internal function, it can only be called by putValueInCache, it is supposed that the
         // value is in the cache already
         // we keep it that way in case of a change of implementation towards database which have a real update function

         var isVinC = this.isValueInCache(key);
         if (isVinC.bool) {// it should be in cache if we arrive, but double checking
            // already in cache, we update the value
            if (isVinC.isInternalStore) {
               // update internalStore
               this.internalStore[key] = fvalue;
               return true;
            }
            else {
               // it is in secondary store, update it there
               var isRes = this.isReservedKey(key);
               if (isRes.bool) {// should be, otherwise error
                  // the key is one of the reserved properties, update in the secondary store
                  this.secondaryStore[isRes.index] = fvalue;
                  return true;
               }
            }
         }
         else {
            // if we arrive here, it is because it is not in either primary and secondary store, so return false
            return false;
         }
      };

      this.isReservedKey = function ( key ) {
         // returns true if the key is one of the reserved ones in jsObjectInternals
         for (var i = 0; i < this.jsOI_length; i++) {
            if (this.jsObjectInternals[i] === key) {
               return {index : i, bool : true};
            }
         }
         return {index : -1, bool : false};
      };

      this.init = function ( arrayInit ) {
         logEntry("CachedValues.init");
         logWrite(DBG.TAG.DEBUG, "input", inspect(arrayInit));
         if (arrayInit && isArray(arrayInit)) {
            arrayInit.forEach(function ( element, index, array ) {
               logWrite(DBG.TAG.DEBUG, "element", inspect(element), element["key"], element["value"]);
               self.putValueInCache(element["key"], element["value"]);
            })
         }
         else {
            logWrite(DBG.TAG.ERROR, "function init called with a parameter that is not an array");
         }
         logExit("CachedValues.init");
      };

      this.init(arrayInit);
   }

   function OutputStore ( init ) {
      // constructor
      var self = this;

      var defaults = {countDown : 1, aStore : [], err : null, deferred : null};
      defaults.propagateResult = function ( err ) {
         //prepare the reault values and call the callback function with it
         // but call it with objects indicating success or failure
         //logEntry("propagateResult");
         /*         if (self.deferred) {
          if (err) {
          logWrite(DBG.TAG.ERROR, "error while propagating result in OutputStore from async call!");
          self.deferred.reject(err);
          }
          else {
          logWrite(DBG.TAG.DEBUG, "Successfully resolved promise with result from async call");
          self.deferred.resolve(self.aStore);
          }
          }
          */
         self.callback(err, self.aStore/*, self.deferred*/);
         //logExit("propagateResult");
      }; // default parameters, execute action after 1 value is stored
      defaults.callback = function ( err, result ) {
         logWrite(DBG.TAG.WARNING, "no callback function for asynchronous function call!");
         logWrite(DBG.TAG.DEBUG, "err, result", err, UT.inspect(result));
      };

      init = init || defaults;

      this.err = defaults.err;
      this.aStore = init.aStore || defaults.aStore;
      this.callback = init.callback || defaults.callback;
      this.countDown = init.countDown || defaults.countDown;
      this.propagateResult = init.propagateResult || defaults.propagateResult;
      this.deferred = init.deferred || defaults.deferred;
      this.setDeferred = function setDeferred ( dfr ) {
         this.deferred = dfr;
      };
      this.getDeferred = function getDeferred () {
         return this.deferred;
      };

      this.setErr = function ( err ) {
         this.err = err;
      };
      this.getErr = function () {
         return this.err;
      };
      this.toString = function () {
         // print the concatenation of all values in storage
         var formatString = "";
         this.aStore.forEach(function ( element, index, array ) {
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
      this.setValueAt = function ( pos, value ) {
         // set some value at index pos
         this.aStore[pos] = value;
      };
      this.getValueAt = function ( pos ) {
         // get the value at index pos
         return this.aStore[pos];
      };
      this.getValuesArray = function () {
         return this.aStore;
      };
      this.invalidateAt = function ( pos ) {
         // update the counter to reflect callback who already returned
         // if all callbacks returned then we can execute the final function to propagate results where it matters
         //logEntry("invalidateAt");
         this.countDown = this.countDown - 1;
         if (this.countDown == 0) {
            this.propagateResult(self.err);
         }
         //logExit("invalidateAt");
      };
      this.push = function ( value ) {
         // add a value in the store and return an index to it
         this.aStore.push(value);
         return this.aStore.length - 1;
      }
   }

   function remove_extra_spaces ( text ) {
      // Example : "    This    should  become   something          else   too . ";
      // -> "This should become something else too.";
      return text.replace(/\s+/g, " ");
   }

   /**
    * Return the text without punctuation sign ; extra spaces are also removed
    * @param text
    * @returns {String}
    */
   function remove_punct ( text ) {
      // cf: http://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
      // Example :"This, -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation";
      var punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~]/g;
      var spaceRE = /\s+/g;
      return text
         .replace(punctRE, '')
         .replace(spaceRE, ' ');
   }

   function escape_html ( text ) {
      // utility function taken from TransOver google extension
      return text.replace(XRegExp("(<|>|&)", 'g'), function ( $0, $1 ) {
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

   function wrap_string ( wrap_begin, word, wrap_end ) {
      return [wrap_begin, word, wrap_end].join("");
   }

   // left padding s with c to a total of n chars
   function padding_left ( s, c, n ) {
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
   function padding_right ( s, c, n ) {
      if (!s || !c || s.length >= n) {
         return s;
      }

      var max = (n - s.length) / c.length;
      for (var i = 0; i < max; i++) {
         s += c;
      }

      return s;
   }

   function fragmentFromString ( strHTML ) {
      var temp = document.createElement('template');
      temp.innerHTML = strHTML;
      return temp.content;
   }

   /**
    * return an array which contains the own properties name of the object passed as parameter
    * @param {Object} obj : object from which own properties are retrieved
    * @return {Array}
    */
   function get_own_properties ( obj ) {
      var aProperties = [];
      for (var prop in obj) {
         if (obj.hasOwnProperty(prop)) {
            aProperties.push(prop);
         }
      }
      return aProperties;
   }

   /**
    * Returns two arrays containing the object properties on one hand, and the properties' value on the other hand
    * @param obj {Object}
    * @returns {{properties: Array, values: Array}}
    */
   function separate_obj_prop ( obj ) {
      var aArgs = [],
          prop_array = [],
          temp_array = [], // temp_array holds the $1, $2, for the arguments. 1 is offset by $index_param
          index = 0,
          aProp = get_own_properties(obj);

      aProp.forEach(function ( prop, index, array ) {
         prop_array.push(prop);
         aArgs.push(obj[prop]);
      });
      return {properties : prop_array, values : aArgs}
   }

   /**
    * Copies the properties of the origin object into the destination object
    * @param destination {Object}
    * @param origin {Object}
    * Returns the destination object in case chaining is needed (with a second origin object for instance)
    */
   function copy_prop_from_obj ( destination, origin ) {
      for (var prop in origin) {
         if (origin.hasOwnProperty(prop)) {
            destination[prop] = origin[prop];
         }
      }
      return destination;
   }

   function hasOwnProperty ( obj, prop ) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
   }

   function fn_get_prop ( prop_name ) {
      return function ( obj ) {
         return obj[prop_name];
      }
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
   function parseDOMtree ( $el, mapTagClass, mapAttrClass, /* boolean optional */ flag_no_transform ) {
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

      //logWrite(DBG.TAG.DEBUG, "parsed HTML", aHTMLparsed.join("\n"));
      return {
         aHTMLparsed      : aHTMLparsed,
         aHTMLtokens      : aHTMLtokens,
         aCommentPos      : aCommentPos,
         html_parsed_text : html_parsed_text,
         aTokens          : html_parsed_text.split(" ")
         //There are spaces in aHTMLparsed, so this split op is not trivial x->x
      };

      function _parseDOMtree ( $el, aHTMLparsed, aHTMLtokens, aCommentPos ) {

         /////// Helper functions

         // Initialize comments structure for isolating non-text nodes
         function reset ( /*out*/ elemPos ) {
            elemPos.pos = undefined;
            elemPos.aCommentToken = [];
         }

         function clone ( elemPos ) {
            return {
               pos           : elemPos.pos,
               aCommentToken : elemPos.aCommentToken
            };
         }

         function simple_tokenizer ( text ) {
            /**
             * Tokenizer :   text => [token] (word array)
             */
            var aTokens = text.split(" ");
            aTokens.type = 'token';
            return aTokens;
         }

         function simple_detokenizer ( aTokens ) {
            return aTokens.join(" ");
         }

         // Set the html content which is not a text node as a comment
         function comment_tag_out ( html_tag ) {
            reset(elemPos);
            elemPos.pos = comment_index;
            simple_tokenizer(html_tag).forEach(function ( token ) {
               elemPos.aCommentToken.push({token : token, action : identity});
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

         if ('undefined' !== flag_no_transform && flag_no_transform) {
            // case when flag_no_transform is true
            // in that case we don't read mapAttr and else, we convert the tag attributes to html
            var arr = [];
            arr.push("<" + tag_name);
            var aDomAttributes = slice.call($el[0].attributes);
            aDomAttributes.forEach(function ( attribute ) {
               arr.push(attribute.nodeName + "='" + attribute.value + "'");
            });
            html_begin_tag = arr.join(" ") + ">";
         }
         else {// read the attributes to map from mapAttrTagClass -> array
            var aAttributes = get_own_properties(mapAttrClass);
            // for each attribute in the array, read the corresponding value from $el
            // and perform the mapping if there is one to perform
            var html_class_attr = aAttributes.reduce(function ( accu, attribute ) {
               var attr_value_in_$el = $el.attr(attribute);
               var replace_attr_value = mapAttrClass[attribute][attr_value_in_$el ?
                                                                attr_value_in_$el.toLowerCase() :
                                                                undefined];
               logWrite(DBG.TAG.DEBUG, "attribute name, attribute value, mapping", attribute, attr_value_in_$el,
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
         aHTMLtokens.push({type          : 'html_begin_tag', text : html_begin_tag,
                             word_number : count_words(html_begin_tag), name : tag_name});
         // and commment it out
         comment_tag_out(html_begin_tag);

         node_index++;
         var aChildren = $el.contents();

         aChildren.each(function ( index, el ) {
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
                  aHTMLtokens.push({type : 'text', text : text, word_number : count_words(text), name : ''});
                  comment_index += simple_tokenizer(text).length;
               }
            }
            else {
               _parseDOMtree($(el), aHTMLparsed, aHTMLtokens, aCommentPos, flag_no_transform);
            }
         });

         // Close the tag, we finished reading its content
         var html_end_tag = "</" + $el.prop("tagName") + ">";
         aHTMLparsed.push(html_end_tag);
         aHTMLtokens.push({type          : 'html_end_tag', text : html_end_tag,
                             word_number : count_words(html_end_tag), name : $el.prop("tagName")});
         // and don't forget to comment it out as to be skipped when highlighting
         comment_tag_out(html_end_tag);
      }
   }

   function parseDOMtree_flatten_text_nodes ( aHTMLTokens ) {
      var aHTMLTokens_split = [];
      aHTMLTokens
         .forEach(function ( html_token ) {
                     switch (html_token.type) {
                        case 'html_begin_tag' :
                        case 'html_end_tag':
                           aHTMLTokens_split.push(html_token);
                           break;
                        case 'text':
                           html_token.text.split(" ").forEach(function ( word ) {
                              aHTMLTokens_split.push({type : 'text', text : word, word_number : word ? 1 : 0});
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

   /**
    * Limitations :
    * - Works only in Chrome V8!!
    * - Also, it is evaluated at runtime, so it would not work for tracing purpose for example.
    * @return {string} the name of the immediately enclosing function in which this function is called
    */
   function get_calling_function_name ( depth ) {
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
   function some ( arr, fun /*, thisArg*/ ) {

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
   function traverse_DOM_depth_first ( type_comparison, start_node, /*optional*/ end_node ) {
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
      function _traverse_DOM_depth_first ( current_node ) {
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

   function sum ( a, b ) {return a + b}

   /**
    * Logical or. No type check on arguments type, return value forced to boolean. Please make sure you pass
    * the right type of arguments
    * @param a {boolean}
    * @param b {boolean}
    * @returns {boolean}
    */
   function or ( a, b ) {return !!(a || b) }

   /**
    * Purpose : returns the instanceof value for objects created through a constructor (new F()...)
    * @param {object} object object whose instanceof value is sought
    * @returns {string} Example getClass($("body")[0]) = "HTMLBodyElement"
    */
   function getClass ( object ) {
      if ('undefined' === typeof object) {
         return 'undefined';
      }
      else {
         return (Object.prototype.toString.call(object).slice(8, -1));
      }
   }

   function getInstanceOf ( object ) {
      // NOTE : that would fail in case of function /*asdas*/ name()
      return /function ([a-zA-Z0-9_$]+)/.exec(object.constructor.toString())[1];
   }

   function is_type_in_prototype_chain ( object, type ) {

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

   function filter_out_prop_by_type ( obj, aProps ) {
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

   function get_prop ( property ) {
      return function ( obj ) {
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
   function make_check_type_message ( type_is_ok, property, actual_instanceof, expected_type, is_proto_chain ) {
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
   function assert_type ( argums, aParamTypeSpecs, options ) {
      // First check the arguments passed in parameters :-)
      var bool_no_exception,
          arity = arguments.length;
      if (arity !== 2 && arity !== 3) {
         throw 'assert_type: expecting 2 or 3 arguments, received ' + arity;
      }
      if (options) {
         bool_no_exception = options.bool_no_exception;
         if (bool_no_exception && 'boolean' !== typeof bool_no_exception) {
            throw 'assert_type: expected optional argument bool_no_exception to be boolean, received type ' +
                  typeof bool_no_exception;
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

      aParamTypeSpecs.forEach(function ( paramTypeSpec ) {
         // paramTypeSpec is similar to {param1: type_spec}
         // aArgs[param_index] will be the argument number index passed as parameter
         var aProps = get_own_properties(paramTypeSpec);
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
            function ( property ) {
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
                     throw 'assert_type: expected a string or array representing the instanceof value(s). Received type ' +
                           typeof expected_type;
                  }
               }

               if (aExpected_type) {// if expected_type is null we skip the type checking for that parameter
                  var is_proto_chain = undefined,
                      exp_index = undefined,
                      actual_instanceof = getClass(current_param);
                  var type_is_ok = aExpected_type
                     .map(function ( expected_type, index ) {
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
            ok      : !err,
            results : aCheckResults
         };
      }
   }

   function assert_properties ( obj, specMap, options ) {
      //specMap :: {prop1: 'type1 | type2', prop2: 'type1 | type2', etc.};
      // First check that all properties exist
      // Note : if one do not want to check a property it is enough not to include it in the specMap
      //        so it is assumed that all specified properties must be DEFINED (can have falsy values)

      // validating inputs and setting key variables
      var err = false,
          bool_no_exception;
      var argCheck = assert_type(arguments, [
         {obj : 'Object', specMap : 'Object'}
      ], {bool_no_exception : true});
      if (argCheck.ok) {
         var aProps = get_own_properties(specMap);
         if (aProps.length === 0) {
            throw 'assert_properties: expected non-empty spec object!';
         }
         if (options) {
            bool_no_exception = options.bool_no_exception;
            if (bool_no_exception && 'boolean' !== typeof bool_no_exception) {
               throw 'assert_properties: expected optional argument bool_no_exception to be boolean, received type ' +
                     typeof bool_no_exception;
            }
         }

         // Actual property type checking
         var aCheckResults = aProps.map(function ( property ) {
            // check obj.property is defined && type(obj.property) in type(specMap.property)
            var curr_obj_prop = obj[property];
            var curr_prop_spec = specMap[property];
            if ('undefined' !== typeof curr_obj_prop) {
               var curr_obj_prop_spec = {};
               curr_obj_prop_spec[property] = curr_prop_spec;
               var propCheck = assert_type([curr_obj_prop], [curr_obj_prop_spec], {bool_no_exception : true});
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
               ok      : !err,
               results : aCheckResults
            };
         }
      }
      else {
         argCheck.results.unshift('calling function: ' + get_calling_function_name(4));
         throw 'assert_properties: ERROR!\n' + argCheck.results.join("\n");
      }
   }

   function log_error ( fn_name/*,  arguments */ ) {
      var args = slice.call(arguments);
      if (args.length < 2) {
         throw 'log_error: called with less parameters than expected, expected at least 2, passed ' +
               args.length;
      }
      else {
         args.shift();
         var message = args.join(" ");
         // TODO : add a CONFIG flag to allow for silent failure or not logging in console
         logWrite(DBG.TAG.ERROR, message);
         throw message;
      }
   }

   //Helper function - error handling in promises
   // a priori useless function for node callback, just use callback directly instead
   function error_handler ( callback ) {
      return function failure ( err ) {
         callback(err.toString(), null);
      }
   }

   /**
    * This is to bridge promise and node-style callbacks. The promise returns always one argument
    * which is in second position in node-style callback
    * @param callback
    * @returns {Function}
    */
   function callback_ok ( callback ) {
      return function call_callback ( result ) {
         callback(null, result);
      }
   }

   function disaggregate_input ( sWords ) {
      /* for now, just takes a string and returns an array of word tokens
       Consecutive spaces are reduced to one
       Trailing and leading spaces signs are taken out
       That includes characters such as \n \r, etc. anything considered spaces by regexp
       puntuation signs are isolated
       Tested on czech, french and english language characters
       */
      // temp.sql: return clean_text(sWords).split(" ");
      return sWords.replace(/[^\u00C0-\u1FFF\u2C00-\uD7FF\w\s]|_/g, function ( $1 ) {
         return ' ' + $1 + ' ';
      }).replace(/\s+/g, ' ').trim().split(' ');
   }

   function identity ( token ) {return token;}

   function f_none () {
      // the empty function - used when there is no action to perform in a callback context
   }

   function default_node_callback ( resolve, reject ) {
      return function ( err, result ) {
         if (err) {
            reject(err);
         }
         else {
            resolve(result);
         }
      }
   }

   ///Helper notes function
   function count_word ( word ) {
      return word ? 1 : 0;
   }

   /**
    * will be false if word="", true otherwise
    * @param word {String}
    * @returns {String}
    */
   function is_word ( word ) {
      return word;
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
   function getEditDistance ( a, b ) {
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
   function delegate_promise_error ( message ) {
      return new RSVP.Promise(function ( resolve, reject ) {
         reject(message);
      })
   }

   var _UT =
       {
          isArray                         : isArray,
          trimInput                       : trimInput,
          isNotEmpty                      : isNotEmpty,
          inspect                         : inspect,
          isRegExp                        : isRegExp,
          isDate                          : isDate,
          isError                         : isError,
          timestamp                       : timestamp,
          inherits                        : inherits,
          _extend                         : _extend,
          hasOwnProperty                  : hasOwnProperty,
          isString                        : isString,
          isPunct                         : isPunct,
          isFunction                      : isFunction,
          sPrintf                         : String.format,
          disaggregate_input              : disaggregate_input,
          timeStamp                       : timeStamp,
          isNumberString                  : isNumberString,
          async_cached                    : async_cached,
          OutputStore                     : OutputStore,
          CachedValues                    : CachedValues,
          getIndexInArray                 : getIndexInArray,
          escape_html                     : escape_html,
          remove_extra_spaces             : remove_extra_spaces,
          remove_punct                    : remove_punct,
          wrap_string                     : wrap_string,
          padding_left                    : padding_left,
          padding_right                   : padding_right,
          fragmentFromString              : fragmentFromString,
          injectArray                     : injectArray,
          get_calling_function_name       : get_calling_function_name,
          parseDOMtree                    : parseDOMtree,
          get_own_properties              : get_own_properties,
          separate_obj_prop               : separate_obj_prop,
          copy_prop_from_obj              : copy_prop_from_obj,
          some                            : some,
          traverse_DOM_depth_first        : traverse_DOM_depth_first,
          fn_get_prop                     : fn_get_prop,
          parseDOMtree_flatten_text_nodes : parseDOMtree_flatten_text_nodes,
          getClass                        : getClass,
          assert_type                     : assert_type,
          assert_properties               : assert_properties,
          is_type_in_prototype_chain      : is_type_in_prototype_chain,
          getInstanceOf                   : getInstanceOf,
          filter_out_prop_by_type         : filter_out_prop_by_type,
          get_prop                        : get_prop,
          slice                           : slice,
          log_error                       : log_error,
          sum                             : sum,
          or                              : or,
          identity                        : identity,
          f_none                          : f_none,
          count_word                      : count_word,
          is_word                         : is_word,
          getEditDistance                 : getEditDistance,
          delegate_promise_error          : delegate_promise_error,
          error_handler                   : error_handler,
          callback_ok                     : callback_ok,
          default_node_callback           : default_node_callback
       };

   _UT.type = {
      string : 'String', array : 'Array', function : 'Function',
      number : 'Number', boolean : 'Boolean', object : 'Object',
      null   : 'Null', undefined : 'undefined'
   };

   if ('undefined' !== typeof window) {
      window.UT = _UT;
   }
   return _UT;
}

(function ( name, definition, context, dependencies ) {
   if (typeof module !== 'undefined' && module.exports) {
      if (dependencies && context['require']) {
         for (var i = 0; i < dependencies.length; i++) {
            context[dependencies[i]] = context['require'](dependencies[i]);
         }
      }
      module.exports = definition.apply(context);
   }
   else if (typeof define === 'function' && define.amd) {
      define(name, (dependencies || []), definition);
   }
   else {
      context[name] = definition.apply(context);
   }
})('utils', utilsFactory, this, []);

/**
 * global define:true module:true window: true
 if (typeof define === 'function' && define['amd']) {
   define(function() { return RSVP; });
} else if (typeof module !== 'undefined' && module['exports']) {
   module['exports'] = RSVP;
} else if (typeof this !== 'undefined') {
   this['RSVP'] = RSVP;
}
 */
