/**
 * Created by bcouriol on 23/06/15.
 */
var winston = require('winston');
winston.emitErrs = true;

/* Configuration :
 Cf. https://github.com/winstonjs/winston
 */
var _myCustomLevels = {
   levels : {
      silly   : 0,
      verbose : 1,
      socket  : 2,
      http    : 3,
      db      : 4,
      data    : 5,
      inspect : 6,
      info    : 7,
      event   : 7,
      input   : 8,
      trace   : 9,
      warn    : 10,
      error   : 11
   },
   colors : {
      silly   : 'cyan',
      verbose : 'cyan',
      socket  : 'grey',
      http    : 'grey',
      data    : 'grey',
      db      : 'grey',
      inspect : 'blue',
      info    : 'green',
      event   : 'green',
      input   : 'magenta',
      trace   : 'magenta',
      warn    : 'red',
      error   : 'red'
   }
};

/* TEST
 Object.keys(myCustomLevels.colors).forEach(function (level) {
 logger.log(level, "127.0.0.1 - there's no place like home")
 });
 */

var factory = function ( module, myCustomLevels ) {
   myCustomLevels = myCustomLevels || _myCustomLevels;
   var logger = new winston.Logger(
      {
         transports  : [
            new winston.transports.Console(
               {
                  handleExceptions : true,
                  json             : false,
                  colorize         : true,
                  level            : 'silly', // lowest level to show everything
                  prettyPrint      : true,
                  silent           : false,
                  timestamp        : function () {
                     return '[' + module + ']'
                  }
               })
         ],
         exitOnError : true,
         levels      : myCustomLevels.levels
      });
   winston.addColors(myCustomLevels.colors);
   return logger;
};

module.exports = factory;
