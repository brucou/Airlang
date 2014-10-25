/**
 * Created by bcouriol on 21/10/14.
 */
/////////////// QUnit testing helper functions
/**
 * Purpose : wrapper allowing to test a given PURE function whose output only depends on its inputs.
 *           Thrown exceptions are not handled or tested against.
 * Usage   : If no transformation functions are passed, then expected output value is tested against
 *           actual value directly.
 * Assumptions :
 * - PURE function
 * - ASYNC function
 * - function must return a thenable object (a promise for example)
 * - function should EVENTUALLY return something (expected output not undefined).
 * @param sTestType
 * @param f
 * @param aInputs
 * @param objExpectedOutput
 * @param aTransforms
 * @param aExpectationMsg
 * @returns {Function}
 */
function QasyncTest ( sTestType, sTestDescription, f, aInputs, aTransforms, objExpectedOutput,
                      aExpectationMsg ) {
   function check_input_args () {
      var aArgs = Array.prototype.slice.call(arguments);
      var arity = aArgs.length;
      var expected_arity = 7;
      if (arity !== expected_arity) {
         throw 'QasyncTest: expected ' + expected_arity + " arguments : got " + arity;
      }
      if (typeof sTestType != 'string') {
         throw 'QasyncTest: expected string parameter for type of test to execute, got parameter of type ' +
               typeof sTestType;
      }
      if (sTestType !== 'equal' && sTestType !== 'deepEqual') {
         throw 'QasyncTest: expected a valid test type for QUnit, got this : ' + sTestType;
      }
      if (typeof sTestDescription != 'string') {
         throw 'QasyncTest: expected string parameter for test description, got parameter of type ' +
               typeof sTestDescription;
      }
      if (!f) {
         throw 'QasyncTest: expected function to test, called with falsy function value!';
      }
      // If no input arguments parameter then process an empty array
      if (!aInputs) {
         aInputs = [];
      }
      if (!!aInputs && !(aInputs instanceof Array)) {
         throw 'QasyncTest: expected array of inputs, called with object of type ' + typeof aInputs;
      }
      // The function must return something to be tested against
      if (!objExpectedOutput) {
         throw 'QasyncTest: function to be tested must return something to be tested against : no expected output parameter passed!';
      }
      if (aTransforms && !(aTransforms instanceof Array)) {
         throw 'QasyncTest: expected array of transformation functions, called with object of type ' +
               typeof aTransforms;
      }
      if (aTransforms && objExpectedOutput && !(objExpectedOutput instanceof Array)) {
         throw 'QasyncTest: expected array of expected outputs, called with object of type ' +
               typeof objExpectedOutput;
      }
      if (aExpectationMsg && !(aExpectationMsg instanceof Array)) {
         throw 'QasyncTest: expected array of test expectations description, called with object of type ' +
               typeof aExpectationMsg;
      }
      if (aTransforms && aExpectationMsg && aTransforms.length !== aExpectationMsg.length) {
         // by construction of the validation, they both have to be array
         // otherwise an error would have been thrown before
         throw 'QasyncTest: test expectation messages must map to transformation function : passed arrays have different lengths';
      }
   }

   check_input_args.apply(this, arguments);

   if (!sTestDescription) {
      if (!f.name) {
         f.displayName = 'no function name passed - anonymous function tested';
      }
      sTestDescription = "testing " + (f.name || f.displayName);
   }

   return function () {

      QUnit.asyncTest(sTestDescription, function ( assert ) {

         var actualOutputPromise = f.apply(null, aInputs);
         actualOutputPromise.then(function ( actualOutput ) {
            QUnit.start();
            // intelligent mapping to allow for the special case of no transform
            aTransforms = aTransforms || [function identity ( x ) {return x}];
            // 2014.10.20 (Bruno) : should not happen because of the validation code used so far but keep it there for now

            // intelligent mapping to allow for the special case of no transform
            // in that case, one can pass directly the expected output as parameter without wrapping it
            // in an array
            if (aTransforms.length === 1 && !(objExpectedOutput instanceof Array)) {
               objExpectedOutput = [objExpectedOutput];
            }
            aTransforms.forEach(function apply_f_transform ( output_transform, index ) {
               assert[sTestType](output_transform(actualOutput),
                                 objExpectedOutput[index],
                                 aExpectationMsg[index]);
            })
         })
      });
   }
}
