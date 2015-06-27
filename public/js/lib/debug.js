/**
 * Created by bcouriol on 2/07/14.
 */
/**
 * Created by bcouriol on 1/06/14.
 */
/**
 *
 */
var DBG = {
   TAG : {
      AUTO_TRACE : "AUTOTRACE",
      TRACE      : "Trace", INFO : "Info", ERROR : "Error",
      WARNING    : "Warning", DEBUG : "DEBUG", EVENT : "Event", SOCK : "Socket"
   },

   SEP : {
      SPACE : " ",
      TAG   : ":",
      ARG   : ":: ",
      NAME  : ":: "},

   CONFIG               : {
      DETAIL     : true,
      BY_DEFAULT : false // if DBG.DETAIL is false, then the by_default behaviour applies for all.
   },
   // empty object by default, should have values of the form :
   // func_name : true to enable detailed config, false defers to default values applyng to all
   // value all if set works for all function contexts
   CONTEXT              : [],
   INDENT_PREFIX        : "",
   INDENT_STRING        : "--",
   INDENT_STRING_LENGTH : 2, // I have to hardcode it apparently. Remember it is INDENT_STRING.length
   MAX_CHAR             : 40,
   CHAR_IN              : ">",
   CHAR_OUT             : "<",
   MAX_LETTERS          : 28,
   ALL                  : "ALL",
   BY_DEFAULT           : "BY_DEFAULT", //!!! This must be the name of the property under config
   DETAIL               : "DETAIL" //!!! This must be the name of the property under config
};

function dbg_config_allows ( tag, context ) {
   if (typeof(DBG.CONFIG[tag][context]) === 'undefined' || DBG.CONFIG[tag][context] === null) {
      DBG.CONFIG[tag][context] = DBG.CONFIG[tag][DBG.BY_DEFAULT];
   }

   // if detailed configs are allowed then look at it, if false don't do anything
   if (DBG.CONFIG[DBG.DETAIL] && DBG.CONFIG[tag][DBG.DETAIL] && !DBG.CONFIG[tag][context]) {
      return false;
   }
   if (DBG.CONFIG[DBG.DETAIL] && !DBG.CONFIG[tag][DBG.DETAIL] && !DBG.CONFIG[tag][DBG.BY_DEFAULT]) {
      return false;
   }
   if (!DBG.CONFIG[DBG.DETAIL] && !DBG.CONFIG[DBG.DETAIL][DBG.BY_DEFAULT]) {
      return false;
   }
   return true;
}

function logEntry ( context, auto_trace ) {
   //context should be the function from which the logEntry is called
   DBG.INDENT_PREFIX += DBG.INDENT_STRING;
   DBG.CONTEXT.push(context);
   logWrite(auto_trace ? DBG.TAG.AUTO_TRACE : DBG.TAG.TRACE,
            DBG.INDENT_PREFIX + DBG.CHAR_IN + DBG.SEP.SPACE + context.toString().slice(0, DBG.MAX_CHAR));
}

function logExit ( context, auto_trace ) {
   //context should be the function from which the logEntry is called
   if (DBG.INDENT_PREFIX.length >= DBG.INDENT_STRING_LENGTH) {
      logWrite(
         auto_trace ? DBG.TAG.AUTO_TRACE : DBG.TAG.TRACE,
         DBG.CHAR_OUT + DBG.INDENT_PREFIX + DBG.SEP.SPACE + context.toString().slice(0, DBG.MAX_CHAR));
      DBG.INDENT_PREFIX = DBG.INDENT_PREFIX.slice(0, DBG.INDENT_PREFIX.length - DBG.INDENT_STRING_LENGTH);
   }
   else {
      logWrite(DBG.TAG.ERROR, "logExit called probably without matching logEntry");
   }
   DBG.CONTEXT.pop();
}

function remove_module_id_from_context ( context ) {
   re = /^\(.*\) (.*)/; //module should be at the beginning and between parenthesis. Ex: (RM) xxxx
   var is_traced = re.exec(context);
   if (null != is_traced) {
      context = is_traced[1];
   }
   return context;
}

function logWrite ( tag, text, arg ) {
   //just writes some text to some output terminal (console, or else)
   //however in function of the tag, one could decide to change the terminal
   // for example trace data could go to a specific file or terminal
   /*
    Add parameters validation : text can't be null or undefined
    */
   var context = DBG.lastElemArray(DBG.CONTEXT);

   if (!dbg_config_allows(tag, context)) {
      return;
   }
   DBG.logForceWrite.apply((this && this.module) ? this : null, arguments);
}

function logWriteShort ( tag, text, arg ) {
   var context = DBG.lastElemArray(DBG.CONTEXT);

   if (!dbg_config_allows(tag, context)) {
      return;
   }

   DBG.logForceWriteShort.apply(null, arguments);
}

function format_calling_function ( calling_function ) {
   if (calling_function.indexOf("Object") >= 0) {
      calling_function = calling_function.replace("Object", "O");
   }
   if (calling_function.indexOf("Array") >= 0) {
      calling_function = calling_function.replace("Array", "A");
   }
   if (calling_function) {
      calling_function = calling_function.substring(0, DBG.MAX_LETTERS);
   }
   return calling_function;
}

/**
 * Purpose   : automatically adds trace logs to show call stack, args. passed when called, and return value
 * Features  : arguments could be shown via a link (to avoid inling which disrupts tracing flows)
 *           : MarkDown format ??
 *           : possibility of switching back to the original unstubbed function
 *           : log time of call, time of return, args passed, and return value
 *           : give a name to the proxy function based on the original function name
 * Arguments : For now, only the module as an input parameter
 * @param {object} module the module (loaded via require.js) which is to be stubbed with trace functions
 * @return   : nothing
 * Action    : All proper FUNCTIONS of the module are stubbed with trace functions, properties are unchanged
 */
function trace ( module, module_name ) {
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
         }
         else {
            module[property] = create_proxy(fn_orig, fn_name, module_name);
         }
      }
   }

   function already_traced ( mod_name ) {
      //console.log("array module", trace.module_array);
      return trace.module_array.indexOf(mod_name) >= 0;
   }
}

trace.rules_array = [];
trace.module_array = [];

trace.config = function config ( property, fn_name, trace_allowed ) {
   if ('boolean' !== typeof trace_allowed) {
      return;
   }
   fn_name = fn_name.trim();
   trace.rules_array[property] = trace.rules_array[property] || [];
   trace.rules_array[property][fn_name] = trace.rules_array[property][fn_name] || trace_allowed;
};

function is_trace_allowed ( property, fn_name ) {
   fn_name = fn_name.trim();
   if (trace.rules_array && trace.rules_array[property] && 'undefined'
      !== typeof trace.rules_array[property][fn_name]) {
      return trace.rules_array[property][fn_name];
   }
   else {
      return true;
   }
}

function create_proxy ( fn_orig, fn_name, module_name ) {
   var fn_proxy;
   var vars = "a,b,c,d,e,f,g,h,i,j,k,l";
   var slice = Array.prototype.slice;
   var f_arity = fn_orig.length;
   fn_name = fn_name.trim();
   var display_name = ['(', module_name, ')', ' ', fn_orig.displayName || fn_name].join("");
   //if (f_arity) {
   eval(
         "fn_proxy = (function " +
         (fn_orig.displayName || fn_name) +
         " /*proxy*/ (" + vars.substring(0, f_arity * 2 - 1) +
         ") { " +
         "DBG.logForceEntry(display_name, true);" +
         "var returnValue = fn_orig.apply(this, slice.call(arguments));" +
         "DBG.logForceExit(display_name, true);" +
         "return returnValue;" +
         "});");
   //}
   //else {
   /*   fn_proxy = function proxyy () {
    DBG.logForceEntry(display_name);
    var returnValue = fn_orig.apply(this, arguments);
    //console.log("return value (", typeof returnValue, ") :", returnValue);
    DBG.logForceExit(display_name);
    return returnValue;
    };
    }*/
   // add also the possible properties attached to the original function
   // and also the prototype of original function
   DBG.extend(fn_proxy, fn_orig);
   fn_proxy.prototype = fn_orig.prototype;
   fn_proxy.displayName = display_name;

   return fn_proxy;
}

function getLogger ( module ) {
   // module is the file (.js for example) which is being
   var logger = {
      entry : logEntry,
      exit  : logExit
   };
   logger.module = module;
   Object.keys(DBG.TAG).forEach(function ( prop ) {
      logger[prop.toLowerCase()] = function () {
         var args = Array.prototype.slice.call(arguments);
         args.unshift(DBG.TAG[prop]);
         logWrite.apply(logger, args);
      }
   });
   return logger;
};

function debugFactory () {

   // Adding back to DBG object all functions in global level
   // this is a hack to allow them to be used both in broswer and node environment
   DBG.dbg_config_allows = dbg_config_allows;
   DBG.logEntry = logEntry;
   DBG.logExit = logExit;
   DBG.remove_module_id_from_context = remove_module_id_from_context;
   DBG.logWrite = logWrite;
   DBG.logWriteShort = logWriteShort;
   DBG.format_calling_function = format_calling_function;
   DBG.trace = trace;
   DBG.is_trace_allowed = is_trace_allowed;
   DBG.create_proxy = create_proxy;
   // this is to allow in node to write LOG.write instead of LOG.logWrite
   DBG.entry = logEntry;
   DBG.exit = logExit;
   DBG.write = logWrite;

   DBG.init = function init ( cfg_options ) {
      for (var prop in cfg_options) {
         if (cfg_options.hasOwnProperty(prop)) {
            DBG[prop] = cfg_options[prop];
         }
      }
   };

   DBG.setConfig = function setConfig ( tag, bool_flag, by_default ) {
      DBG.CONFIG[tag] = {DETAIL : bool_flag, BY_DEFAULT : by_default.by_default};
      return setConfig; // for chaining
   };

   DBG.default_config = function default_config () {
      // set config for all tags
      Object.keys(DBG.TAG).forEach(function ( key ) {
         DBG.setConfig(DBG.TAG[key], false, {by_default : true}); // always trace by default
      });
   };

   DBG.enableLog = function enableLog ( TAG, context ) {
      DBG.setLog(TAG, context, true);
      return enableLog;
   };

   DBG.disableLog = function disableLog ( TAG, context ) {
      DBG.setLog(TAG, context, false);
      return disableLog;
   };

   DBG.setLog = function setLog ( TAG, context, bool_flag ) {
      // LIMITATION : context cannot be a reserved javascript function to avoid problem
      DBG.CONFIG[TAG][context] = bool_flag;
   };

   DBG.logForceEntry = function logForceEntry ( context, auto_trace ) {
      //remove (module_name) from context
      context = remove_module_id_from_context(context);
      if ('undefined' !== typeof DBG.FORCE_TRACE && DBG.FORCE_TRACE) {
         var tag = DBG.TAG.TRACE;
         var cfg_tag_ctxt = DBG.CONFIG[tag][context];
         var cfg_tag_detail = DBG.CONFIG[tag][DBG.DETAIL];
         DBG.CONFIG[tag][context] = true;
         DBG.CONFIG[tag][DBG.DETAIL] = true;
      }
      logEntry(context, auto_trace);
      if ('undefined' !== typeof DBG.FORCE_TRACE && DBG.FORCE_TRACE) {
         DBG.CONFIG[tag][context] = cfg_tag_ctxt;
         DBG.CONFIG[tag][DBG.DETAIL] = cfg_tag_detail;
      }
   };

   DBG.logForceExit = function logForceExit ( context, auto_trace ) {
      context = remove_module_id_from_context(context);
      if ('undefined' !== typeof DBG.FORCE_TRACE && DBG.FORCE_TRACE) {
         var tag = DBG.TAG.TRACE;
         var cfg_tag_ctxt = DBG.CONFIG[tag][context];
         var cfg_tag_detail = DBG.CONFIG[tag][DBG.DETAIL];
         DBG.CONFIG[tag][context] = true;
         DBG.CONFIG[tag][DBG.DETAIL] = true;
      }
      logExit(context, auto_trace);
      if ('undefined' !== typeof DBG.FORCE_TRACE && DBG.FORCE_TRACE) {
         DBG.CONFIG[tag][context] = cfg_tag_ctxt;
         DBG.CONFIG[tag][DBG.DETAIL] = cfg_tag_detail;
      }
   };

   DBG.logForceWriteShort = function logForceWriteShort ( tag, text, arg ) {
      var i;
      var context = DBG.lastElemArray(DBG.CONTEXT);
      if (context) {
         context = context.substring(0, DBG.MAX_LETTERS);
      }

      //console.log(DBG.padding_right(tag, ' ', 6) + DBG.SEP.TAG + text);
      // for trace it is 7, for debug, info it is 5
      // remove Object. if any
      // Ex: Object.compute_text_stats_group_by_div: [compute_text_stats_group_] i, div, tagName:: 11:: #copyright2:: P
      var calling_function = DBG.get_calling_function_name(5);
      calling_function = format_calling_function(calling_function);

      //text_old = ['[', DBG.padding_right(context, ' ', DBG.MAX_LETTERS), ']', ' ', text].join("");
      text = ['[', DBG.padding_right(calling_function, ' ', DBG.MAX_LETTERS), ']', ' ', text].join("");
      console.log(DBG.padding_right(tag, ' ', 6) + DBG.SEP.TAG + text);

      if (arguments.length > 2) {
         for (i = 2; i != arguments.length; i++) {
            if (typeof arguments[i] === 'undefined' || null == arguments[i]) {
               text += DBG.SEP.ARG + "??"
            }
            else {
               console.dir(arguments[i]);
            }
         }
      }
      //console.log(DBG.padding_right(tag, ' ', 6) + DBG.SEP.TAG + text);
      // for trace it is 7, for debug, info it is 5
      // remove Object. if any
      // Ex: Object.compute_text_stats_group_by_div: [compute_text_stats_group_] i, div, tagName:: 11:: #copyright2:: P

   };

   DBG.logForceWrite = function logForceWrite ( tag, text, arg ) {
      var i;
      var context = DBG.lastElemArray(DBG.CONTEXT);
      if (context) {
         context = context.substring(0, DBG.MAX_LETTERS);
      }

      //console.log(DBG.padding_right(tag, ' ', 6) + DBG.SEP.TAG + text);
      // for trace it is 7, for debug, info it is 5
      // remove Object. if any
      // Ex: Object.compute_text_stats_group_by_div: [compute_text_stats_group_] i, div, tagName:: 11:: #copyright2:: P

      var calling_function = DBG.get_calling_function_name((tag === DBG.TAG.AUTO_TRACE) ? 7 : 6);
      calling_function = format_calling_function(calling_function);

      //text_old = ['[', DBG.padding_right(context, ' ', DBG.MAX_LETTERS), ']', ' ', text].join("");
      text = (tag === DBG.TAG.AUTO_TRACE)
         ? text
         : ['[', DBG.padding_right(calling_function, ' ', DBG.MAX_LETTERS), ']', ' ', text].join("");
      /*        if (arguments.length > 20) {
       for (i = 2; i != arguments.length; i++) {
       if (typeof arguments[i] === 'undefined' || null == arguments[i]) {
       text += DBG.SEP.ARG + "??"
       }
       else {
       text += DBG.SEP.ARG + arguments[i].toString();
       }
       }
       }
       */
      var time_now = (new Date() + "").substr(16, 8);

      // constructing the array of arguments to pass to console.log
      // we do this way to keep the inspector in the chrome dev console with drowdown menu
      // instead of [Object object]
      var args = Array.prototype.slice.call(arguments);
      var module = (this && this.module)
         ? "(" + this.module + ")"
         : "";
      args[0] = (tag === DBG.TAG.AUTO_TRACE)
         ? (time_now + " " + module + " | ")
         : (time_now + " " + module + " | " + DBG.padding_right(tag, ' ', 6) + DBG.SEP.TAG);
      console.log.apply(console, args);
   };

   /////////////// Helper functions
   /**
    * Helper function already contained in utils
    */

   /**
    * Limitations :
    * - Works only in Chrome V8!!
    * - Also, it is evaluated at runtime, so it would not work for tracing purpose for example.
    * @return {string} the name of the immediately enclosing function in which this function is called
    */
   DBG.get_calling_function_name = function get_calling_function_name ( depth ) {
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
   };

   DBG.lastElemArray = function lastElemArray ( array ) {
      return array[array.length - 1];
   };

   DBG.padding_right = function padding_right ( s, c, n ) {
      if (!s || !c || s.length >= n) {
         return s;
      }

      var max = (n - s.length) / c.length;
      for (var i = 0; i < max; i++) {
         s += c;
      }

      return s;
   };

   DBG.rpad = function rpad ( s, len, ch ) {
      ch = ch || ' ';
      while (s.length < len) {
         s += ch;
      }
      return s;
   };

   DBG.lpad = function lpad ( s, len, ch ) {
      ch = ch || ' ';
      while (s.length < len) {
         s = ch + s;
      }
      return s;
   };

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
   };

   DBG.shorten = function shorten ( text ) {
      const MAX_LENGTH = 200;
      return text.substring(1, MAX_LENGTH) + "...";
   }

   DBG.show_own_methods = function show_own_methods ( obj ) {
      var property;
      for (property in obj) {
         if (obj.hasOwnProperty(property) && 'function' === typeof obj[property]) {
            console.log(property)
         }
      }
   }
   /////////////// Helper functions

   /////////////// TRACE functionalities
   DBG.isObject = function ( obj ) {
      var type = typeof obj;
      return type === 'function' || type === 'object' && !!obj;
   };

   DBG.extend = function ( obj ) {
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
   // Configuration of the module
   DBG.default_config();

   DBG.getLogger = getLogger;

   return DBG;
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
      define((dependencies || []), definition);
   }
   else {
      // ONLY FOR DEBUG we put in global variable !!!!!!
      /*context[name] = */
      definition.apply(context);
   }
})('DBG', debugFactory, this, []);
/**
 * Created by bcouriol on 8/02/15.
 */
