/**
 * Created by bcouriol on 3/06/14.
 */

/*
 postgres practice
 */
//http://sqlfiddle.com/#!15/34dd2/58
/* SELECT to_tsvector('fat cats ate fat rats') @@ to_tsquery('fat & rat'); */
/*
 select to_tsvector('english', 'Obvinění z porušování příměří, které je součástí širšího mírového plánu, však přicházejí i z druhé strany. „Premiér“ proruské Doněcké lidové republiky Alexandr Borodaj na sobotní tiskové konferenci tvrdil, že ostřelování je východoukrajinského města Slavjansk ukrajinskými jednotkami pokračuje. Podobně se vyjádřil také proruský gubernátor Donbasu Pavel Gubarev.')
 @@ to_tsquery('english', 'a | se | v | na | je | že | s | z | o | do | to | i | k | ve | si | pro | za | by | ale | jsem | jako | po | V | tak | jsou | které | od | který | jeho | však | už | nebo | byl | jen | co | bude | aby | u | jak | až | A | než | má | jsme | ze | která | když | při | být | bylo
 ');
 select ts_headline('english', '„Vladimir Putin podporuje rozhodnutí prezidenta Ukrajiny Petra Porošenka vyhlásit příměří na jihovýchodě Ukrajiny, stejně jako jeho záměr učinit několik konkrétních kroků k mírovému vyrovnání,“ uvedl Kreml v oficiálním prohlášení.Porošenkův mírový plán by podle Moskvy neměl být ultimátem. Obě strany musí využít příležitost a začít konstruktivní jednání, které povede k politickým kompromisům, citovala prohlášení Kremlu agentura ITAR-TASS.„Hlava ruského státu ale poukázala na to, že navrhovaný plán bez praktických činů k zahájení vyjednávacího procesu není životaschopný a realistický.“Jednostranné zastavení bojů na východě Ukrajiny, které má proruským separatistům umožnit složit zbraně, oznámil Porošenko v pátek. Ukrajinské ministerstvo vnitra k příměří uvedlo, že vládní složky budou střílet jen tehdy, pokud se dostanou pod palbu. Rebelové však zatím odmítli složit zbraně, dokud se armáda nestáhne (více čtěte zde).
 ' , to_tsquery('english', 'a | se | v | na | je | že | s | z | o | do | to | i | k | ve | si | pro | za | by | ale | jsem | jako | po | V | tak | jsou | které | od | který | jeho | však | už | nebo | byl | jen | co | bude | aby | u | jak | až | A | než | má | jsme | ze | která | když | při | být | bylo'
 ), 'StartSel="<span class=''highlight''>",StopSel=</span>
 , HighlightAll=true');

 Results:
 „Vladimir Putin podporuje rozhodnutí prezidenta Ukrajiny Petra Porošenka vyhlásit příměří <span class='highlight'>na</span> jihovýchodě Ukrajiny, stejně <span class='highlight'>jako</span> <span class='highlight'>jeho</span> záměr učinit několik konkrétních kroků <span class='highlight'>k</span> mírovému vyrovnání,“ uvedl Kreml <span class='highlight'>v</span> oficiálním prohlášení.Porošenkův mírový plán by podle Moskvy neměl <span class='highlight'>být</span> ultimátem. Obě strany musí využít příležitost a začít konstruktivní jednání, <span class='highlight'>které</span> povede <span class='highlight'>k</span> politickým kompromisům, citovala prohlášení Kremlu agentura ITAR-TASS.„Hlava ruského státu <span class='highlight'>ale</span> poukázala <span class='highlight'>na</span> to, <span class='highlight'>že</span> navrhovaný plán bez praktických činů <span class='highlight'>k</span> zahájení vyjednávacího procesu není životaschopný a realistický.“Jednostranné zastavení bojů <span class='highlight'>na</span> východě Ukrajiny, <span class='highlight'>které</span> <span class='highlight'>má</span> proruským separatistům umožnit složit zbraně, oznámil Porošenko <span class='highlight'>v</span> pátek. Ukrajinské ministerstvo vnitra <span class='highlight'>k</span> příměří uvedlo, <span class='highlight'>že</span> vládní složky budou střílet <span class='highlight'>jen</span> tehdy, pokud <span class='highlight'>se</span> dostanou pod palbu. Rebelové <span class='highlight'>však</span> zatím odmítli složit zbraně, dokud <span class='highlight'>se</span> armáda nestáhne (více čtěte zde).

 Czech sentence for checking cs full text search
 Příliš žluťoučký kůň se napil žluté vody
 select * from ts_debug('cs','Příliš žluťoučký kůň se napil žluté vody');
 SELECT ts_lexize('cspell','napil'); ->napit
 */

/*
 client.query("select string_agg(word, ' | ') as freq_words from pgWordFrequency where freq_cat = 'A';",
 function (err, result) {
 if (err) {
 return console.error('error running query', err);
 }
 qryImportantWords = result.rows[0].freq_words;
 console.log("qry: " + qryImportantWords);
 //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
 });
 */

/* One word for testing function displaying word translation
 pglemmatranslationcz.translation_lemma,
 pglemmatranslationcz.translation_sense,
 pglemmaen.lemma_gram_info,
 pglemmaen.lemma,
 pglemmaen.sense,
 pglemmatranslationcz.translation_gram_info,
 pgwordfrequency_short.freq_cat
 "avšak";"formálněji";"conj";"but";"(yet)";"sp";"A "
 "avšak";"na začátku věty, méně časté";"adv";"however";"(on the other hand)";"sp";"A "
 "avšak";"na začátku věty, méně časté";"adv";"however";"(nonetheless)";"sp";"A "
 "avšak";"na začátku věty, méně časté";"adv";"however";"(despite that)";"sp";"A "
 */

/**
 * Purpose : returns the instanceof value for objects created through a constructor (new F()...)
 * @param {object} object object whose instanceof value is seeked
 * @returns {string} Example getClass($("body")[0]) = "HTMLBodyElement"
 */
function getClass ( object ) {
   return (Object.prototype.toString.call(object).slice(8, -1));
   //or   /function ([a-zA-Z0-9_$]+)/.exec(a.constructor.toString())[1]
   // but that would fail in case of function /*asdas*/ name()
}

function getInstanceOf ( object ) {
   return /function ([a-zA-Z0-9_$]+)/.exec(object.constructor.toString())[1];
}

function is_type_in_prototype_chain ( object, type ) {

   var curObj = object,
      inst_of;
   console.log(typeof object);
   if (['string', 'number', 'boolean', 'array', 'function'].indexOf(typeof object) > -1) {
      return false;
   }
   do {
      inst_of = getInstanceOf(Object.getPrototypeOf(curObj));
      curObj = Object.getPrototypeOf(curObj);
      //console.log(inst_of, curObj);
   }
   while (inst_of !== 'Object' && inst_of !== type);
   return (inst_of === type);
}

/**
 * Purpose : checks type of a function arguments again a type specification.
 *           Throws an exception if one argument does not match its  specification
 *           Note: null and undefined are of type object, as such they will never match another type specification
 *           and thus they might raise an exception.
 *           IMPORTANT NOTE : Does not work for jQuery!!
 * @param argums {arguments} first parameter should always be arguments to pass the arguments of the calling function
 * @param aParamTypeSpecs   array of object with the following spec : [ {param1: type_spec}, {param2: type_spec}, ... ]
 *                          type_spec is :
 *                          - defined js types (checked with typeof) : UT.type.[string|boolean|number|...]
 *                          - constructor types (checked with instanceof) : 'constructor name'
 *                          For instance :
 *                          assert_type (arguments, [{aParamTypeSpecs: UT.type.array}, {$el: 'Element'}])
 * @param options {object}  Three optional properties :
 *                          - bool_no_exception if undefined or false -> throw an exception in case of error
 *                          - bool_allow_null if undefined or false -> throw an exception if a param is null
 *                          - bool_allow_undefined if undefined or false -> throw an exception if a param is undefined
 *                          NOTE : bool_no_exception takes precedence over the other two, i.e. if set to true,
 *                          even in case of null and undefined parameter no exception will be thrown.
 *                          The error will however be logged in the array of checking results
 * @return {Array}          If no exception is to be thrown then returns an array whose properties match the
 *                          aParamTypeSpecs parameter. Value of those properties allow to check whether the
 *                          specification was fulfilled or not.
 *                          OK: xxx -> spec fulfilled for param
 *                          NOK: xxx -> spec not fulfilled for param
 */
function assert_type ( argums, aParamTypeSpecs, options ) {
   // nice to have : add type checking for optional parameters as well
   // This could take the shape of {aParamTypeSpecs: UT.type.array}, {$el: '*Element'}
   // that however complicated the algorithm
   // we would first need to fill in the (key, values) for the non-optional parameters, and then
   // match the optional parameters (in the order they are passed) on whatever args are left

   // First check the arguments passed in parameters :-)
   var bool_no_exception,
      bool_allow_null,
      bool_allow_undefined,
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
      bool_allow_null = options.bool_allow_null;
      if (bool_allow_null && 'boolean' !== typeof bool_allow_null) {
         throw 'assert_type: expected optional argument bool_allow_null to be boolean, received type ' +
               typeof bool_allow_null;
      }
      bool_allow_undefined = options.bool_allow_undefined;
      if (bool_allow_undefined && 'boolean' !== typeof bool_allow_undefined) {
         throw 'assert_type: expected optional argument bool_allow_undefined to be boolean, received type ' +
               typeof bool_allow_undefined;
      }
   }
   if (!argums) {
      throw 'assert_type: expecting argument argums, received falsy value';
   }
   if (!aParamTypeSpecs) {
      throw 'assert_type: expecting argument aParamTypeSpecs, received falsy value';
   }

   // Get the arguments whose type is to be checked as an array
   var aArgs = slice.call(argums);
   var aCheckResults = [];
   var param_index = 0; //1 is starting index to skip arguments
   var err;
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
      aProps.forEach(
         function ( property ) {
            var expected_type = paramTypeSpec[property];
            // this should be a string
            var current_param = aArgs[param_index++];
            // edge cases of null and undefined value for params
            if ('undefined' === typeof current_param) {
               if (!bool_allow_undefined) {
                  // this means by default, bool_allow_undefined is false (undefined is falsy)
                  err = true;
                  aCheckResults.push("NOK: Parameter " + property + " is undefined");
               }
               else {
                  aCheckResults.push("OK: Parameter " + property + " is undefined");
               }
            }
            else if (current_param === null) {
               if (!bool_allow_null) {
                  // this means by default, bool_allow_undefined is false (undefined is falsy)
                  err = true;
                  aCheckResults.push("NOK: Parameter " + property + " is null");
               }
               else {
                  aCheckResults.push("OK: Parameter " + property + " is null");
               }
            }
            // normal cases, first check expected_type is a string
            // todo : getClass to return undefined or null
            // todo : remove bool_allow, it will be in the spec ex: property: ['string','undefined']
            // todo : put err=true directly as an argument to a function
            // todo : which factors out the message formatting
            // todo : finally forEach expected_type.map -> array of OK,NOK -> reduce -> the OR of the array
            //        map at the aProps level, return the reduced message array
            // todo : formatting function :: boolean err, property, actual_type, expected_type, bool in_proto_chain
            // todo : write test (simple, just to execute repeteadly in shell chrome F12)
            else if ('string' === typeof expected_type) {
               var actual_instanceof = getClass(current_param);
               if (expected_type === actual_instanceof) {
                  aCheckResults.push("OK: Parameter " + property + " has type " +
                                     expected_type)
               }
               else if (is_type_in_prototype_chain(current_param, expected_type)) {
                  aCheckResults.push("OK: Parameter " + property + " has type " +
                                     actual_instanceof + " itself inheriting from type " +
                                     expected_type)
               }
               else {
                  // we haven't found parameter to be of the expected type neither in the prototype chain
                  err = true;
                  aCheckResults.push("NOK: Parameter " + property + " has type '" +
                                     actual_instanceof + "' - expected type '" + expected_type +
                                     "'")
               }
            }
            else {
               throw 'assert_type: expected a string representing the instanceof value. Received type' +
                     typeof expected_type;
            }
         }
      );
   });

   // throws an exception if undefined or false
   if (!bool_no_exception && err) {
      throw 'assert_type: TYPE ERROR!\n' + aCheckResults.join("\n");
   }
   else {
      return aCheckResults;
   }
   //assert_arity(arguments, expected_arity, optional)
}

//Testing code for assert_type
spec =
{chaine : "string", nombre : "Number", tableau : 'Array', boolean : 'Boolean', objet : 'Object', null_obj : 'Null', undefined_obj : 'undefined'};
f = function ( chaine, nombre, tableau, boolean, objet, null_obj, undefined_obj ) {
   console.log(UT.assert_type(arguments, [spec]))
};
f(); //Exception outputing messages
f("");
f("", 2);
f("", []);
f("", {});
f("", "");
f("", 2, false);
f("", 2, undefined);
f("", 2, null);
f("", 2, [], false, {}, null);
f("", 2, [], false, {}, null, null);
f("", 2, [], false, {}, null, undefined);

f = function ( chaine, nombre, tableau, boolean, objet, null_obj, undefined_obj ) {
   console.log(UT.assert_type(arguments, [
      {chaine : "String", nombre : "Number", tableau : 'Array', boolean : 'Boolean', objet : 'Object', null_obj : 'Null', undefined_obj : 'undefined'}
   ], {bool_no_exception : true}))
};
f(); // no exceptions
f("");
f("", 2);
f("", []);
f("", {});
f("", "");
f("", 2, false);
f("", 2, undefined);
f("", 2, null);
f("", 2, [], false, {}, null); //ok: true
f("", 2, [], false, {}, null, null);
f("", 2, [], false, {}, null, undefined); // ok: true

f = function ( chaine, nombre, tableau, boolean, objet, null_obj, undefined_obj ) {
   console.log(UT.assert_type(arguments, [
      {chaine : "String", nombre : null, tableau : 'Array', boolean : 'Boolean', objet : 'Object', null_obj : 'Null', undefined_obj : 'undefined'}
   ], {bool_no_exception : false}))
}
f("", 2, [], false, {}, null, undefined); // ok: true
f("", "", [], false, {}, null, undefined); // ok : true - null allows to skip checking type of second parameter
f(); // the rest works as usual (no exceptions)
f("");
f("", 2);
f("", []);
f("", {});
f("", "");
f("", [], false);
f("", 2, undefined);
f("", 2, null);
f("", 2, [], false, {}, null); //ok: true
f("", 2, [], false, {}, null, null);
f("", 2, [], false, {}, null, undefined); // ok: true

f = function ( chaine, nombre, tableau, boolean, objet, null_obj, undefined_obj ) {
   console.log(UT.assert_type(arguments, [
      {chaine : null, nombre : null, tableau : null, boolean : null, objet : null, null_obj : null, undefined_obj : 'undefined'}
   ], {bool_no_exception : false}))
}
f(); // no exceptions, ok: true

f = function ( chaine, nombre, tableau, boolean, objet, null_obj, undefined_obj ) {
   console.log(UT.assert_type(arguments, [
      {chaine : ['String', 'Null'], nombre : null, tableau : null, boolean : null, objet : null, null_obj : null, undefined_obj : 'undefined'}
   ], {bool_no_exception : false}))
}
f(""); // checking array of type as spec for one property
f(null);
f([]); //ok : false

f = function ( chaine, nombre, tableau, boolean, objet, null_obj, undefined_obj ) {
   console.log(UT.assert_type(arguments, [
      {chaine : ['String', 'Element'], nombre : null, tableau : null, boolean : null, objet : null, null_obj : null, undefined_obj : 'undefined'}
   ], {bool_no_exception : false}))
};
f(document.body); //checking custom_type constructor type (instanceof) and prototype chaining, here Element
