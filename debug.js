/**
 * Created by bcouriol on 2/07/14.
 */
/**
 * Created by bcouriol on 1/06/14.
 */
/**
 * TODO : MODULARITY
 * - run exact same debug.js on client and server
 *       cf http://caolanmcmahon.com/posts/writing_for_node_and_the_browser/
 *       Right now, all the exports are at the end, and that should be the only difference between client and server
 *
 */

DBG = {
   TAG: {
      TRACE  : "Trace", INFO: "Info", ERROR: "Error",
      WARNING: "Warning", DEBUG: "DEBUG"
   },

   SEP: {
      SPACE: " ",
      TAG  : ": ",
      ARG  : ":: ",
      NAME : ":: "},

   CONFIG              : {
      DETAIL    : true,
      BY_DEFAULT: false // if DBG.DETAIL is false, then the by_default behaviour applies for all.
   },
   // empty object by default, should have values of the form :
   // func_name : true to enable detailed config, false defers to default values applyng to all
   // value all if set works for all function contexts
   CONTEXT             : [],
   INDENT_PREFIX       : "",
   INDENT_STRING       : "--",
   INDENT_STRING_LENGTH: 2, // I have to hardcode it apparently. Remember it is INDENT_STRING.length
   MAX_CHAR            : 40,
   CHAR_IN             : ">",
   CHAR_OUT            : "<",
   MAX_LETTERS         : 25,
   ALL                 : "ALL",
   BY_DEFAULT          : "BY_DEFAULT", //!!! This must be the name of the property under config
   DETAIL              : "DETAIL" //!!! This must be the name of the property under config
};

DBG.inspect = function (obj) {return obj;}; // node already has a console.log which use inspect

DBG.setConfig = function setConfig (tag, bool_flag, by_default) {
   DBG.CONFIG[tag] = {DETAIL: bool_flag, BY_DEFAULT: by_default.by_default};
   return setConfig; // for chaining
}

DBG.default_config = function default_config () {
   DBG.setConfig(DBG.TAG.TRACE, false, {by_default: true}); // always trace
   DBG.setConfig(DBG.TAG.INFO, false, {by_default: true});
   DBG.setConfig(DBG.TAG.ERROR, false, {by_default: true});
   DBG.setConfig(DBG.TAG.WARNING, true, {by_default: true}); //
   DBG.setConfig(DBG.TAG.DEBUG, false, {by_default: true}); //
};

DBG.enableLog = function enableLog (TAG, context) {
   DBG.setLog(TAG, context, true);
   return enableLog;
}

DBG.disableLog = function disableLog (TAG, context) {
   DBG.setLog(TAG, context, false);
   return disableLog;
}

DBG.setLog = function setLog (TAG, context, bool_flag) {
   // LIMITATION : context cannot be a reserved javascript function to avoid problem
   DBG.CONFIG[TAG][context] = bool_flag;
}

function logEntry (context) {
   //context should be the function from which the logEntry is called
   DBG.INDENT_PREFIX += DBG.INDENT_STRING;
   DBG.CONTEXT.push(context);
   logWrite(DBG.TAG.TRACE, DBG.INDENT_PREFIX + DBG.CHAR_IN + DBG.SEP.SPACE + context.toString().slice(0, DBG.MAX_CHAR));
}

function logExit (context) {
   //context should be the function from which the logEntry is called
   if (DBG.INDENT_PREFIX.length >= DBG.INDENT_STRING_LENGTH) {
      logWrite(
         DBG.TAG.TRACE,
         DBG.CHAR_OUT + DBG.INDENT_PREFIX + DBG.SEP.SPACE + context.toString().slice(0, DBG.MAX_CHAR));
      DBG.INDENT_PREFIX = DBG.INDENT_PREFIX.slice(0, DBG.INDENT_PREFIX.length - DBG.INDENT_STRING_LENGTH);
   }
   else {
      logWrite(DBG.TAG.ERROR, "logExit called probably without matching logEntry");
   }
   DBG.CONTEXT.pop();
}

DBG.logForceEntry = function logForceEntry (context) {
   var tag = DBG.TAG.TRACE;
   var cfg_tag_ctxt = DBG.CONFIG[tag][context];
   var cfg_tag_detail = DBG.CONFIG[tag][DBG.DETAIL];
   DBG.CONFIG[tag][context] = true;
   DBG.CONFIG[tag][DBG.DETAIL] = true;
   logEntry(context);
   DBG.CONFIG[tag][context] = cfg_tag_ctxt;
   DBG.CONFIG[tag][DBG.DETAIL] = cfg_tag_detail;
}

DBG.logForceExit = function logForceExit (context) {
   var tag = DBG.TAG.TRACE;
   var cfg_tag_ctxt = DBG.CONFIG[tag][context];
   var cfg_tag_detail = DBG.CONFIG[tag][DBG.DETAIL];
   DBG.CONFIG[tag][context] = true;
   DBG.CONFIG[tag][DBG.DETAIL] = true;
   logExit(context);
   DBG.CONFIG[tag][context] = cfg_tag_ctxt;
   DBG.CONFIG[tag][DBG.DETAIL] = cfg_tag_detail;
}

function logWrite (tag, text, arg) {
   //just writes some text to some output terminal (console, or else)
   //however in function of the tag, one could decide to change the terminal
   // for example trace data could go to a specific file or terminal
   /*
    Add parameters validation : text can't be null or undefined
    */
   var context = DBG.lastElemArray(DBG.CONTEXT);

   if (typeof(DBG.CONFIG[tag][context]) === 'undefined' || DBG.CONFIG[tag][context] === null) {
      DBG.CONFIG[tag][context] = DBG.CONFIG[tag][DBG.BY_DEFAULT];
   }

   // if detailed configs are allowed then look at it, if false don't do anything
   if (DBG.CONFIG[DBG.DETAIL] && DBG.CONFIG[tag][DBG.DETAIL] && !DBG.CONFIG[tag][context]) {
      return;
   }
   if (DBG.CONFIG[DBG.DETAIL] && !DBG.CONFIG[tag][DBG.DETAIL] && !DBG.CONFIG[tag][DBG.BY_DEFAULT]) {
      return;
   }
   if (!DBG.CONFIG[DBG.DETAIL] && !DBG.CONFIG[DBG.DETAIL][DBG.BY_DEFAULT]) {
      return;
   }
   DBG.logForceWrite.apply(null, arguments);
}

DBG.logForceWrite = function logForceWrite (tag, text, arg) {
   var i;
   var context = DBG.lastElemArray(DBG.CONTEXT);
   if (context) {
      context = context.substring(0, DBG.MAX_LETTERS);
   }
   text = ['[', DBG.padding_right(context, ' ', DBG.MAX_LETTERS), ']', ' ', text].join("");
   if (arg) {
      for (i = 2; i != arguments.length; i++) {
         if (!arguments[i]) {
            text += DBG.SEP.ARG + "??"
         }
         else {
            text += DBG.SEP.ARG + arguments[i].toString();
         }
      }
   }
   console.log(DBG.padding_right(tag, ' ', 6) + DBG.SEP.TAG + text);
}

/////////////// Helper functions
/**
 * Helper function already contained in utils
 */
DBG.set_inspect_function = function set_inspect_function() {
   if ('undefined' !== typeof UT) {DBG.inspect = UT.inspect};
}

DBG.lastElemArray = function lastElemArray (array) {
   return array[array.length - 1];
}

DBG.padding_right = function padding_right (s, c, n) {
   if (!s || !c || s.length >= n) {
      return s;
   }

   var max = (n - s.length) / c.length;
   for (var i = 0; i < max; i++) {
      s += c;
   }

   return s;
}

DBG.rpad = function rpad (s, len, ch) {
   ch = ch || ' ';
   while (s.length < len) {
      s += ch;
   }
   return s;
}

DBG.lpad = function lpad (s, len, ch) {
   ch = ch || ' ';
   while (s.length < len) {
      s = ch + s;
   }
   return s;
}

/**
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 */
DBG.timeStamp = function timeStamp () {
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

DBG.shorten = function shorten (text) {
   const MAX_LENGTH = 200;
   return text.substring(1, MAX_LENGTH) + "...";
}

DBG.show_own_methods = function show_own_methods (obj) {
   var property;
   for (property in obj) {
      if (obj.hasOwnProperty(property) && 'function' === typeof obj[property]) {
         console.log(property)
      }
   }
}
/////////////// Helper functions

/////////////// TRACE functionalities
DBG.isObject = function (obj) {
   var type = typeof obj;
   return type === 'function' || type === 'object' && !!obj;
};

DBG.extend = function (obj) {
   if (!DBG.isObject(obj)) {
      return obj;
   }
   var source, prop;
   for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
         if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
         }
      }
   }
   return obj;
};

function trace (module, module_name) {
   /**
    * Purpose   : automatically adds trace logs to show call stack, args. passed when called, and return value
    * Features  : arguments could be shown via a link (to avoid inling which disrupts tracing flows)
    *           : MarkDown format ??
    *           : possibility of switching back to the original unstubbed function
    *           : log time of call, time of return, args passed, and return value
    *           : give a name to the proxy function based on the original function name
    * Arguments : For now, only the module as an input parameter
    * @param module {object} the module (loaded via require.js) which is to be stubbed with trace functions
    * Returns   : nothing
    * Action    : All proper FUNCTIONS of the module are stubbed with trace functions, properties are unchanged
    * TODO : Implement features
    * TODO : Test on require module!!
    */
   var property;
   if (already_traced(module_name)) {
      return;
   }
   trace.module_array.push(module_name);
   for (property in module) {
      if (module.hasOwnProperty(property) && 'function' === typeof module[property]) {
         var fn_name = module[property].name;
         var fn_orig = module[property];
         if (!is_trace_allowed(property, fn_name)) {
            console.log("not allowed on ", property, " ", fn_name);
            continue;
         } else {
            module[property] = create_proxy(fn_orig, fn_name, module_name);
         }
      }
   }

   function already_traced (mod_name) {
      //console.log("array module", trace.module_array);
      return trace.module_array.indexOf(mod_name) >= 0;
   }
}

trace.rules_array = [];
trace.module_array = [];

trace.config = function config (property, fn_name, trace_allowed) {
   if ('boolean' !== typeof trace_allowed) {
      return;
   }
   fn_name = fn_name.trim();
   trace.rules_array[property] = trace.rules_array[property] || [];
   trace.rules_array[property][fn_name] = trace.rules_array[property][fn_name] || trace_allowed;
}

function is_trace_allowed (property, fn_name) {
   fn_name = fn_name.trim();
   if (trace.rules_array && trace.rules_array[property] && 'undefined' !== typeof trace.rules_array[property][fn_name]) {
      return trace.rules_array[property][fn_name];
   }
   else {
      return true;
   }
}

function create_proxy (fn_orig, fn_name, module_name) {
   var fn_proxy;
   var vars = "a,b,c,d,e,f,g,h,i,j,k,l";
   var slice = Array.prototype.slice;
   var f_arity = fn_orig.length;
   fn_name = fn_name.trim();
   var display_name = ['(', module_name, ')', ' ', fn_orig.displayName || fn_name].join("");
   if (f_arity) {
      eval(
            "fn_proxy = (function proxy(" + vars.substring(0, f_arity * 2 - 1) +
            ") { " +
            "DBG.logForceEntry(display_name);" +
            "var returnValue = fn_orig.apply(this, slice.call(arguments));" +
            "DBG.logForceExit(display_name);" +
            "return returnValue;" +
            "});");
   } else {
      fn_proxy = function proxyy () {
         DBG.logForceEntry(display_name);
         var returnValue = fn_orig.apply(this, arguments);
         //console.log("return value (", typeof returnValue, ") :", returnValue);
         DBG.logForceExit(display_name);
         return returnValue;
      };
   }
   // add also the possible properties attached to the original function
   // and also the prototype of original function
   DBG.extend(fn_proxy, fn_orig);
   fn_proxy.prototype = fn_orig.prototype;

   return fn_proxy;
}

DBG.LOG_RETURN_VALUE = function (obj) {
   DBG.set_inspect_function();
   logWrite(DBG.TAG.DEBUG, "Returns : ", DBG.shorten(DBG.inspect(obj)));
};

DBG.LOG_INPUT_VALUE = function (arg_list_txt /* argument list*/) {
   /**
    * arg_list_txt : string taken from the parameter line of the function source
    *                Ex: function ($el, ev) -> arg_list_txt should be '$el, ev'
    * argument_list: actual arguments passed to the function corresponding to arg_list_txt
    */
   DBG.set_inspect_function();
   const ARG_SEP = ',';
   var arity = arguments.length;
   if (arity === 0) {
      // pathological case, should not happen, do nothing
      logWrite(DBG.TAG.WARNING, "When logging arguments passed to function: LOG_INPUT_VALUE called with no arguments");
   }
   if (arity === 1) {
      // then the first parameter should be an empty chain
      if (arg_list_txt.trim().length !== 0) {
         throw "When logging arguments passed to function: A non-empty list of args (" + arg_list_txt + ") is passed but no arguments to correspond for it";
      }
      logWrite(DBG.TAG.DEBUG, "Called without arguments");
   }
   var args = Array.prototype.slice.call(arguments);
   args.shift(); // removing first arg (arg_list_txt)
   var arg_list = arg_list_txt.split(ARG_SEP);

   if (args.length !== arg_list.length) {
      throw 'When logging arguments passed to function: list of parameters and number of parameters passed mismatch'
   }

   logWrite(DBG.TAG.DEBUG, "Called with:");
   arg_list.forEach(
      function (value, index, array) {
         logWrite(DBG.TAG.DEBUG, arg_list[index], DBG.shorten(DBG.inspect(args[index])));
      });
};
/////////////// TRACE functionalities

// Configuration of the module
DBG.default_config();

// exporting debug functions
exports.TAG = DBG.TAG;
exports.CONTEXT = DBG.CONTEXT;
exports.setConfig = DBG.setConfig;
exports.default_config = DBG.default_config;
exports.enableLog = DBG.enableLog;
exports.disableLog = DBG.disableLog;
exports.setLog = DBG.setLog;
exports.entry = logEntry;
exports.exit = logExit;
exports.write = logWrite;
exports.trace = trace;
exports.trace.config = trace.config;
exports.LOG_RETURN_VALUE = DBG.LOG_RETURN_VALUE;
exports.LOG_INPUT_VALUE = DBG.LOG_INPUT_VALUE;
