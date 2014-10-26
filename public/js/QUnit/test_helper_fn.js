/**
 * Created by bcouriol on 26/10/14.
 */
/**
 * Created by bcouriol on 9/10/14.
 */
define(['ReaderModel', 'TranslateController', 'data_struct', 'utils', 'jquery'],
       function ( RM, TC, DS, UT, $ ) {
          var actual; // will contain the actual_value returned by the function tested
          /*
           QUnit.test("a basic test example", function ( assert ) {
           var value = "hello";
           assert.equal(value, "hello", "We expect value to be hello");
           });
           */

          QUnit.module("Testing async. function tester QasyncTest");
          QasyncTest("equal", "function with one parameter, no transforms",
                     function dummy_1_var ( x ) {
                        var dfr = $.Deferred();
                        dfr.resolve(5 * x);
                        return dfr.promise();
                     },
                     [2], null, 10, ['should be equal to 10']
          )();
          QasyncTest("equal", "function with 3 parameters, no transforms",
                     function dummy_3_var ( x, y, z ) {
                        var dfr = $.Deferred();
                        dfr.resolve(5 * x * y * z);
                        return dfr.promise();
                     },
                     [2, 0.5, 3], null, 15, ['should be equal to 15']
          )();
          QasyncTest("equal", "function with 3 parameters including one array, no transforms",
                     function dummy_3_var_array ( x, aY, z ) {
                        var dfr = $.Deferred();
                        dfr.resolve(5 * x * aY[0] * z.length);
                        return dfr.promise();
                     },
                     [2, [0.5], 'abc'], null, 15, ['should be equal to 15']
          )();
          QasyncTest("equal", "function with string parameters, involving 2 transforms",
                     function dummy_with_transform ( text ) {
                        var dfr = $.Deferred();
                        dfr.resolve(text);
                        return dfr.promise();
                     },
                     ['texte de quatre mots'],
                     [function ( x ) {return x.length}, function ( x ) {return x.substr(6)}],
                     [20, 'de quatre mots'],
                     ['checked length of string', 'checked string extraction']
          )();

          QUnit.module("helper functions - DOM");
          QUnit.test("traverse_DOM_depth_first", function ( assert ) {
             var aExperiments = [];
             var aExpected = [];
             var aHTMLfragments = ["<div id='2'></div>", " ", "<p id='3'> končil </p>", " ", "<span class='highlight'>Když</span>",
                                   "Když", " končil ", "<span class='highlight'>projekt</span>", "projekt",
                                   " Presseurop, ",
                                   "<a id='4'> psali jsme </a>", " psali jsme ", " , že ",
                                   "<span class='highlight'>neříkáme</span>",
                                   "neříkáme", " sbohem, nýbrž „na shledanou“. ", " "];
             var aNodes = [];
             var div_element = document.createElement("div");
             aHTMLfragments.forEach(function ( html_text ) {
                div_element.innerHTML = html_text;
                aNodes.push(div_element.firstChild);
             });
             aExperiments.push($("<div id='2'> <p id='3'> <span class='highlight'>Když</span> končil <span class='highlight'>projekt</span> Presseurop, <a id='4'> psali jsme </a> , že <span class='highlight'>neříkáme</span> sbohem, nýbrž „na shledanou“. </p> </div>"));

             aExperiments.forEach(function ( $experiment, exp_index ) {
                var aDomNodes = UT.traverse_DOM_depth_first("same content", $experiment[0]);
                assert.equal(aDomNodes.length, aNodes.length, "no end node, loose equality, testing length");
                aDomNodes.forEach(function (node, index) {
                   assert.equal(node.tagName, aNodes[index].tagName, "no end node, loose equality, testing tagName");
                   assert.equal(node.nodeType, aNodes[index].nodeType, "no end node, loose equality, testing nodeType");
                });
             });

             aExperiments.forEach(function ( $experiment, exp_index ) {
                var aDomNodes = UT.traverse_DOM_depth_first("same content", $experiment[0], $experiment[0].lastChild);
                // length should be 2, just start and end nodes as the " " nodes is in second position and equality is not strict
                assert.equal(aDomNodes.length, 2, "no end node, loose equality, testing length");
                aDomNodes.forEach(function (node, index) {
                   assert.equal(node.tagName, aNodes[index].tagName, "end node ' ', loose equality, testing tagName");
                   assert.equal(node.nodeType, aNodes[index].nodeType, "end node ' ', loose equality, testing nodeType");
                });
             });

             aExperiments.forEach(function ( $experiment, exp_index ) {
                var aDomNodes = UT.traverse_DOM_depth_first("===", $experiment[0], $experiment[0].lastChild);
                // length should be 2, just start and end nodes as the " " nodes is in second position and equality is not strict
                assert.equal(aDomNodes.length, aNodes.length, "end node, loose equality, testing length");
                aDomNodes.forEach(function (node, index) {
                   assert.equal(node.tagName, aNodes[index].tagName, "end node ' ', strict equality, testing tagName");
                   assert.equal(node.nodeType, aNodes[index].nodeType, "end node ' ', strict equality, testing nodeType");
                });
             });

             aExperiments.forEach(function ( $experiment, exp_index ) {
                var aDomNodes = UT.traverse_DOM_depth_first("===", $experiment[0]);
                // length should be 2, just start and end nodes as the " " nodes is in second position and equality is not strict
                assert.equal(aDomNodes.length, aNodes.length, "no end node, loose equality, testing length");
                aDomNodes.forEach(function (node, index) {
                   assert.equal(node.tagName, aNodes[index].tagName, "no end node ' ', strict equality, testing tagName");
                   assert.equal(node.nodeType, aNodes[index].nodeType, "no end node ' ', strict equality, testing nodeType");
                });
             });

          });

          return {};
       });
