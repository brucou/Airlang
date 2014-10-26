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

          QUnit.test("Domtree parsing", function ( assert ) {
             // too long: var $el = $("<div id='comments-7381574' class='comments '>                                                                 <table>                                                                 <tbody data-remaining-comments-count='7' data-canpost='false' data-cansee='true' data-comments-unavailable='false' data-addlink-disabled='true'>                                                                    <tr id='comment-8921799' class='comment '>                                                                       <td class='comment-actions'>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                      <span title='number of 'useful comment' votes received' class='cool'>1</span>                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>Thanks for chiming in.  This does look like a better answer.</span>                                                                          –&nbsp;                                                                             <a href='/users/207/james-sulak' title='10539 reputation' class='comment-user'>James Sulak</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment8921799_7381574'><span title='2011-09-12 13:08:27Z' class='relativetime-clean'>Sep 12 '11 at 13:08</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                    <tr id='comment-8922292' class='comment '>                                                                       <td>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                   &nbsp;&nbsp;                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>@James: A Range-only answer coupled with a <code>TextRange</code>-based thing for older IE will cover more browsers than my answer though, so depending on the OP's requirements yours may be better.</span>                                                                          –&nbsp;                                                                             <a href='/users/96100/tim-down' title='130747 reputation' class='comment-user'>Tim Down</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment8922292_7381574'><span title='2011-09-12 13:34:26Z' class='relativetime-clean'>Sep 12 '11 at 13:34</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                    <tr id='comment-8928662' class='comment '>                                                                       <td>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                   &nbsp;&nbsp;                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>two of you are great people. thanks two of you, so I change the mark to tim, but also thanks to james</span>                                                                          –&nbsp;                                                                             <a href='/users/499587/yuli-chika' title='1760 reputation' class='comment-user owner'>yuli chika</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment8928662_7381574'><span title='2011-09-12 19:14:55Z' class='relativetime-clean'>Sep 12 '11 at 19:14</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                    <tr id='comment-9550106' class='comment '>                                                                       <td>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                   &nbsp;&nbsp;                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>Your demo works for me on IE8, but on FF4 it selects only the word under the mouse and the space after it, rather than expanding the current selection to include any partially selected words. This also means if the you move the mouse down off the text before releasing the button that the selection does not change at all.</span>                                                                          –&nbsp;                                                                             <a href='/users/146567/sam' title='189 reputation' class='comment-user'>Sam</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment9550106_7381574'><span title='2011-10-20 09:38:44Z' class='relativetime-clean'>Oct 20 '11 at 9:38</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                    <tr id='comment-29530407' class='comment '>                                                                       <td class='comment-actions'>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                      <span title='number of 'useful comment' votes received' class='cool'>1</span>                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>@Paul: I'll take a look when I have a bit more time. In the meantime, I've solved the same problem (admittedly with a mountain of code) in my <a href='https://code.google.com/p/rangy/' rel='nofollow'>Rangy</a> library: <a href='http://rangy.googlecode.com/svn/trunk/demos/textrange.html' rel='nofollow'>rangy.googlecode.com/svn/trunk/demos/textrange.html</a></span>                                                                          –&nbsp;                                                                             <a href='/users/96100/tim-down' title='130747 reputation' class='comment-user'>Tim Down</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment29530407_7381574'><span title='2013-11-08 09:32:12Z' class='relativetime-clean'>Nov 8 '13 at 9:32</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                 </tbody>             </table>               </div>");
             var $el = $("<div class='analisis'>                                           <h2><a href='http://cultura.elpais.com/cultura/2014/09/10/actualidad/1410368372_535616.html'>Medio siglo de oro de artistas y canciones</a></h2>                                                                                                                                                                                       <p class='firma'>Por Luis Merino</p>             <p class='txt'>Un lanzamiento de 24 discos, 360 canciones, 3.000 temas. Los álbumes funcionan como <i>'playlists'</i> de una hora cuyas canciones han sido remasterizadas para ofrecer una calidad espectacular.</p>                                                                                                                                                                                                                                                                                                              </div>");
             var mapTagClass = {},
                 mapAttrClass = {};
             mapTagClass["TITLE"] = 'title';
             mapAttrClass["class"] = {};
             mapAttrClass["class"]["title"] = 'title';

             var parsedTree = UT.parseDOMtree($el, mapTagClass, mapAttrClass),
                 aHTMLparsed = parsedTree.aHTMLparsed,
                 aHTMLparsed_expected = [
                    "<DIV id='0'>",
                    "<H2 id='1'>", "<A id='2'>", "Medio siglo de oro de artistas y canciones", "</A>", "</H2>",
                    "<P id='3'>", "Por Luis Merino", "</P>",
                    "<P id='4'>",
                    "Un lanzamiento de 24 discos, 360 canciones, 3.000 temas. Los álbumes funcionan como ",
                    "<I id='5'>", "'playlists'", "</I>",
                    " de una hora cuyas canciones han sido remasterizadas para ofrecer una calidad espectacular.",
                    "</P>",
                    "</DIV>"
                 ],
                 aCommentPos = parsedTree.aCommentPos,
                 aTokens = parsedTree.aTokens;

             // test that parsing is correct
             assert.deepEqual(aHTMLparsed, aHTMLparsed_expected,
                              ["DOM Tree parsed correctly"/*, aHTMLparsed*/].join("\n"));

             //test that comment pos matches token pos in aTokens
             aCommentPos.forEach(function ( commentPos, index, array ) {
                assert.equal(aTokens[commentPos.pos], commentPos.aCommentToken[0].token,
                             "Calculated comment position matches array of tokens");
             });
          });

          return {};
       });
