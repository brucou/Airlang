/**
 * Created by bcouriol on 27/06/14.
 */
const pgVERBATIM = "$random_some$"; // !! if this is already in the text, there will be a problem

function f_none () {
   // the empty function - used when there is no action to perform in a callback context
}

function wrap_string ( wrap_begin, word, wrap_end ) {
   return [wrap_begin, word, wrap_end].join("");
}

function print_rows ( rows ) {
   for (var i = 0; i < result.rows.length; i++) {
      console.log(result.rows[i]);
   }
}

function pg_escape_string ( string ) {
   return pgVERBATIM + string + pgVERBATIM;
}

function copy_own_properties ( obj ) {
   var copy_obj = {};
   for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
         copy_obj[prop] = obj[prop];
      }
   }
   return copy_obj;
}

function get_own_properties ( obj ) {
   /**
    * return an array which contains the own properties name of the object passed as parameter
    * @param {Object} obj : object from which own properties are retrieved
    */
   var aProperties = [];
   for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
         aProperties.push(prop);
      }
   }
   return aProperties;
}

module.exports = {
   f_none              : f_none,
   wrap_string         : wrap_string,
   print_rows          : print_rows,
   pg_escape_string    : pg_escape_string,
   copy_own_properties : copy_own_properties,
   get_own_properties  : get_own_properties
};
