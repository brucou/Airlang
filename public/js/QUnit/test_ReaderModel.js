/**
 * Created by bcouriol on 9/10/14.
 */
define(['ReaderModel', 'data_struct', 'utils'],
       function ( RM, DS, UT ) {
          var dup_assert;
          var actual; // will contain the actual_value returned by the function tested
          /*
           QUnit.test("a basic test example", function ( assert ) {
           var value = "hello";
           assert.equal(value, "hello", "We expect value to be hello");
           });
           */

          QUnit.module("Testing filtering functionality");
          QUnit.asyncTest("one filter", function ( assert ) {
             expect(1);
             var expected = [ 'Člověku', 'se',
                              '<span class = \'highlight\'>kvůli</span>',
                              'tomu,',
                              '<', 'inserted', 'comment', '>',
                              'že', 'přestane', 'kouřit,', 'zpomalí', 'metabolismus.', 'A', 'to', 'je',
                              '<span class = \'highlight\'>hlavní</span>',
                              '<span class = \'highlight\'>problém,</span>',
                              'proč',
                              '<span class = \'highlight\'>většině</span>',
                              'lidí',
                              '<span class = \'highlight\'>začne</span>',
                              'ručička', 'váhy', 'ukazovat', 'za',
                              '<span class = \'highlight\'>pár</span>',
                              '<span class = \'highlight\'>měsíců</span>',
                              'o',
                              '<span class = \'highlight\'>několik</span>',
                              'kilogramů',
                              '<span class = \'highlight\'>více.</span>' ].join(" ");
             RM.apply_highlighting_filters_to_text(
                "Člověku se kvůli tomu, < inserted comment > že přestane kouřit, zpomalí metabolismus. A to je hlavní problém, proč většině lidí začne ručička váhy ukazovat za pár měsíců o několik kilogramů více.",
                [RM.highlight_words],
                RM.simple_tokenizer, RM.simple_detokenizer,
                DS.filter_comment_remover
             ).then(function ( result ) {
                       actual = result;
                       QUnit.start();
                       assert.equal(actual, expected, ["expected :", expected, "\n returned :", actual].join(" "));
                    });
          });

          /**
           * Two filters:
           * 1. fn_highlight = span.highlight
           * 2. fn_highlight = span.highlight
           * First and second filter has no overlapping word, so both words from filter 1 and 2 should be span.highlight
           */
          QUnit.asyncTest("two filters - not overlapping", function ( assert ) {
             var expected = "<span class = 'highlight'>Člověku</span> se <span class = 'highlight'>kvůli</span> tomu, " +
                            ['<', 'inserted', 'comment', '>',
                             'že', 'přestane', 'kouřit,', 'zpomalí', 'metabolismus.', 'A', 'to', 'je',
                             '<span class = \'highlight\'>hlavní</span>',
                             '<span class = \'highlight\'>problém,</span>',
                             'proč',
                             '<span class = \'highlight\'>většině</span>',
                             'lidí',
                             '<span class = \'highlight\'>začne</span>',
                             'ručička', 'váhy', 'ukazovat', 'za',
                             '<span class = \'highlight\'>pár</span>',
                             '<span class = \'highlight\'>měsíců</span>',
                             'o',
                             '<span class = \'highlight\'>několik</span>',
                             'kilogramů',
                             '<span class = \'highlight\'>více.</span>'
                            ].join(" ");
             var filter2 = function filter2 ( text, callback ) {
                if (text.indexOf("Člověku") >= 0) {
                   text = text.replace("Člověku", "<span class = 'highlight'>Člověku</span>");
                }
                console.log("text stop words", text);
                return text;
             };
             DS.filter_register('text', 'async_cached_postgres_highlighted_text', filter2,
                                'srv_qry_stop_words');

             RM.apply_highlighting_filters_to_text(
                "Člověku se kvůli tomu, < inserted comment > že přestane kouřit, zpomalí metabolismus. A to je hlavní problém, proč většině lidí začne ručička váhy ukazovat za pár měsíců o několik kilogramů více.",
                [RM.highlight_words, filter2],
                RM.simple_tokenizer, RM.simple_detokenizer,
                DS.filter_comment_remover
             ).then(function ( actual ) {
                       QUnit.start();
                       assert.equal(actual, expected, ["expected :", expected, "\n returned :", actual].join(" "));
                    });
          });

          /**
           * Two filters:
           * 1. fn_highlight = span.highlight
           * 2. fn_highlight = span.highlight2
           * Second filter has some overlapping to-highlight words with filter 1. Filter 1 should prevail
           * For the words where only filter 2 applies, we should see span.highlight2
           */
          QUnit.asyncTest("two filters - overlapping - first has priority", function ( assert ) {

             var expected = "<span class = 'highlight2'>Člověku</span> se <span class = 'highlight'>kvůli</span> tomu, " +
                            ['<', 'inserted', 'comment', '>',
                             'že', 'přestane', 'kouřit,', 'zpomalí', 'metabolismus.', 'A', 'to', 'je',
                             '<span class = \'highlight\'>hlavní</span>',
                             '<span class = \'highlight\'>problém,</span>',
                             'proč',
                             '<span class = \'highlight\'>většině</span>',
                             'lidí',
                             '<span class = \'highlight\'>začne</span>',
                             'ručička', 'váhy', 'ukazovat', 'za',
                             '<span class = \'highlight\'>pár</span>',
                             '<span class = \'highlight\'>měsíců</span>',
                             'o',
                             '<span class = \'highlight\'>několik</span>',
                             'kilogramů',
                             '<span class = \'highlight\'>více.</span>'
                            ].join(" ");
             var filter2 = function filter2 ( text, callback ) {
                if (text.indexOf("Člověku") >= 0) {
                   text = text.replace("Člověku", "<span class = 'highlight2'>Člověku</span>");
                }
                if (text.indexOf("hlavní") >= 0) {
                   text = text.replace("hlavní", "<span class = 'highlight2'>hlavní</span>");
                }
                return text;
             };

             var dataAdapterOStore2TokenActionMap2 = function dataAdapterOStore2TokenActionMap2 ( aStore ) {
                function fn_html_highlight ( token ) {
                   return [StartSel, token, StopSel].join("");
                }

                var StartSel = "<span class = 'highlight2'>";
                var StartSel_nospaces = StartSel.replace(/ /g, "_");
                var StopSel = "</span>";
                var StopSel_nospaces = StopSel.replace(/ /g, "_");
                var highlit_text = aStore.toString();
                logWrite(DBG.TAG.DEBUG, "highlit_text", highlit_text);
                // TODO: to synchronize better with server instead of copying :
                highlit_text = highlit_text.replace(new RegExp(StartSel, "g"), StartSel_nospaces);
                highlit_text = highlit_text.replace(new RegExp(StopSel, "g"), StopSel_nospaces);

                var adapter = RM.simple_tokenizer;
                var aTokens = adapter(highlit_text);
                //logWrite(DBG.TAG.DEBUG, "aTokens", aTokens);
                var aTokenActionMap = [];
                var mark = false;
                // I have the token, now assigning actions
                aTokens.forEach(function ( word, index ) {
                   if (word.indexOf(StartSel_nospaces) == 0) {
                      // beginning of marking
                      //logWrite(DBG.TAG.DEBUG, "found begin of marking");
                      word = word.replace(new RegExp(StartSel_nospaces, "g"), "");
                      //logWrite(DBG.TAG.DEBUG, "word after removal of startsel marking: ", word);
                      mark = true;
                   }
                   if (mark == true && word.indexOf(StopSel_nospaces) > 0) {
                      //logWrite(DBG.TAG.DEBUG, "found end of marking");
                      word = word.replace(new RegExp(StopSel_nospaces, "g"), "");
                      //logWrite(DBG.TAG.DEBUG, "word after removal of stopsel marking: ", word);
                      logWrite(DBG.TAG.DEBUG, "associating action highlight to word ", word);
                      aTokenActionMap.push({token : word, action : fn_html_highlight});
                      mark = false;
                   }
                   else if (mark === true) {
                      logWrite(DBG.TAG.DEBUG, "associating action highlight to word ", word);
                      aTokenActionMap.push({token : word, action : fn_html_highlight});
                   }
                   else {
                      //logWrite(DBG.TAG.DEBUG, "associating action none to word ", word);
                      aTokenActionMap.push({token : word, action : DS.filter_default});
                   }

                });

                return aTokenActionMap;
             };

             DS.filter_register('text', 'async_cached_postgres_highlighted_text2', filter2,
                                'srv_qry_stop_words');
             DS.filter_register_data_adapters('async_cached_postgres_highlighted_text2', 'token_action_map',
                                              dataAdapterOStore2TokenActionMap2);

             RM.apply_highlighting_filters_to_text(
                "Člověku se kvůli tomu, < inserted comment > že přestane kouřit, zpomalí metabolismus. A to je hlavní problém, proč většině lidí začne ručička váhy ukazovat za pár měsíců o několik kilogramů více.",
                [RM.highlight_words, filter2],
                RM.simple_tokenizer, RM.simple_detokenizer,
                DS.filter_comment_remover
             ).then(function ( actual ) {
                       QUnit.start();
                       assert.equal(actual, expected, ["expected :", expected, "\n returned :", actual].join(" "));
                    });
          });

          /**
           * TODO testing:
           * - test cases where no output data adapter is needed (e.g. filter directly outputs TokenActionMap datatype)
           * - test error processing (filter not registered, adapter not registered, etc)
           */

          QUnit.module("Testing note highlighting functionality");
          QUnit.test("Domtree parsing", function ( assert ) {
             // too long: var $el = $("<div id='comments-7381574' class='comments '>                                                                 <table>                                                                 <tbody data-remaining-comments-count='7' data-canpost='false' data-cansee='true' data-comments-unavailable='false' data-addlink-disabled='true'>                                                                    <tr id='comment-8921799' class='comment '>                                                                       <td class='comment-actions'>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                      <span title='number of 'useful comment' votes received' class='cool'>1</span>                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>Thanks for chiming in.  This does look like a better answer.</span>                                                                          –&nbsp;                                                                             <a href='/users/207/james-sulak' title='10539 reputation' class='comment-user'>James Sulak</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment8921799_7381574'><span title='2011-09-12 13:08:27Z' class='relativetime-clean'>Sep 12 '11 at 13:08</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                    <tr id='comment-8922292' class='comment '>                                                                       <td>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                   &nbsp;&nbsp;                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>@James: A Range-only answer coupled with a <code>TextRange</code>-based thing for older IE will cover more browsers than my answer though, so depending on the OP's requirements yours may be better.</span>                                                                          –&nbsp;                                                                             <a href='/users/96100/tim-down' title='130747 reputation' class='comment-user'>Tim Down</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment8922292_7381574'><span title='2011-09-12 13:34:26Z' class='relativetime-clean'>Sep 12 '11 at 13:34</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                    <tr id='comment-8928662' class='comment '>                                                                       <td>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                   &nbsp;&nbsp;                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>two of you are great people. thanks two of you, so I change the mark to tim, but also thanks to james</span>                                                                          –&nbsp;                                                                             <a href='/users/499587/yuli-chika' title='1760 reputation' class='comment-user owner'>yuli chika</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment8928662_7381574'><span title='2011-09-12 19:14:55Z' class='relativetime-clean'>Sep 12 '11 at 19:14</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                    <tr id='comment-9550106' class='comment '>                                                                       <td>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                   &nbsp;&nbsp;                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>Your demo works for me on IE8, but on FF4 it selects only the word under the mouse and the space after it, rather than expanding the current selection to include any partially selected words. This also means if the you move the mouse down off the text before releasing the button that the selection does not change at all.</span>                                                                          –&nbsp;                                                                             <a href='/users/146567/sam' title='189 reputation' class='comment-user'>Sam</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment9550106_7381574'><span title='2011-10-20 09:38:44Z' class='relativetime-clean'>Oct 20 '11 at 9:38</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                    <tr id='comment-29530407' class='comment '>                                                                       <td class='comment-actions'>                                                                          <table>                                                                             <tbody>                                                                                <tr>                                                                                   <td class=' comment-score'>                                                                                      <span title='number of 'useful comment' votes received' class='cool'>1</span>                                                                                   </td>                                                                                   <td>                                                                                   &nbsp;                                                                                   </td>                                                                                </tr>                                                                             </tbody>                                                                          </table>                                                                       </td>                                                                       <td class='comment-text'>                                                                          <div style='display: block;' class='comment-body'>                                                                             <span class='comment-copy'>@Paul: I'll take a look when I have a bit more time. In the meantime, I've solved the same problem (admittedly with a mountain of code) in my <a href='https://code.google.com/p/rangy/' rel='nofollow'>Rangy</a> library: <a href='http://rangy.googlecode.com/svn/trunk/demos/textrange.html' rel='nofollow'>rangy.googlecode.com/svn/trunk/demos/textrange.html</a></span>                                                                          –&nbsp;                                                                             <a href='/users/96100/tim-down' title='130747 reputation' class='comment-user'>Tim Down</a>                                                                             <span class='comment-date' dir='ltr'><a class='comment-link' href='#comment29530407_7381574'><span title='2013-11-08 09:32:12Z' class='relativetime-clean'>Nov 8 '13 at 9:32</span></a></span>                                                                          </div>                                                                       </td>                                                                    </tr>                                                                 </tbody>             </table>               </div>");
             var $el = $("<div class='analisis'>                                           <h2><a href='http://cultura.elpais.com/cultura/2014/09/10/actualidad/1410368372_535616.html'>Medio siglo de oro de artistas y canciones</a></h2>                                                                                                                                                                                       <p class='firma'>Por Luis Merino</p>             <p class='txt'>Un lanzamiento de 24 discos, 360 canciones, 3.000 temas. Los álbumes funcionan como <i>'playlists'</i> de una hora cuyas canciones han sido remasterizadas para ofrecer una calidad espectacular.</p>                                                                                                                                                                                                                                                                                                              </div>");
             var parsedTree = UT.parseDOMtree($el),
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

          /*
          QUnit.asyncTest("Text highlighting - one filter", function ( assert ) {
             var parsedTree = UT.parseDOMtree($el),
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
                 ];
             var expected = [ 'Člověku', 'se',
                              '<span class = \'highlight\'>kvůli</span>',
                              'tomu,',
                              '<', 'inserted', 'comment', '>',
                              'že', 'přestane', 'kouřit,', 'zpomalí', 'metabolismus.', 'A', 'to', 'je',
                              '<span class = \'highlight\'>hlavní</span>',
                              '<span class = \'highlight\'>problém,</span>',
                              'proč',
                              '<span class = \'highlight\'>většině</span>',
                              'lidí',
                              '<span class = \'highlight\'>začne</span>',
                              'ručička', 'váhy', 'ukazovat', 'za',
                              '<span class = \'highlight\'>pár</span>',
                              '<span class = \'highlight\'>měsíců</span>',
                              'o',
                              '<span class = \'highlight\'>několik</span>',
                              'kilogramů',
                              '<span class = \'highlight\'>více.</span>' ].join(" ");
             RM.apply_highlighting_filters_to_text(
                "Člověku se kvůli tomu, < inserted comment > že přestane kouřit, zpomalí metabolismus. A to je hlavní problém, proč většině lidí začne ručička váhy ukazovat za pár měsíců o několik kilogramů více.",
                [RM.highlight_words],
                RM.simple_tokenizer, RM.simple_detokenizer,
                function filter_comment_remover ( aTokens ) {
                   return parsedTree.aCommentPos;
                }
             ).then(function ( result ) {
                       actual = result;
                       QUnit.start();
                       assert.equal(actual, expected, ["expected :", expected, "\n returned :", actual].join(" "));
                    });
          });

*/
          var t_RM = {};
          return t_RM;
       });
