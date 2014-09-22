var argumentsRegExp = /\(([\s\S]*?)\)/;
var replaceRegExp = /[ ,\n\r\t]+/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

window.__introspect__ = function (fn) {
   var fnStr = fn.toString().replace(STRIP_COMMENTS, '');
   var fnArguments = argumentsRegExp.exec(fnStr)[1].trim();
   if (0 === fnArguments.length) {
      return [];
   }
   return fnArguments.split(replaceRegExp);
};

/*
var ARGUMENT_NAMES = /([^\s,]+)/g;
 var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
window.getParamNames = function getParamNames(func) {
   var fnStr = func.toString().replace(STRIP_COMMENTS, '');
   var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
   //does not work if one of the parameter has a "(" character but that would not make sense right?
   if (result === null) {
      result = [];
   }
   return result
};
 */
