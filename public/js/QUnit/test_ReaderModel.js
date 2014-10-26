/**
 * Created by bcouriol on 9/10/14.
 */
define(['ReaderModel', 'TranslateController', 'data_struct', 'utils', 'jquery'],
       function ( RM, TC, DS, UT, $ ) {
          var dup_assert;
          var actual; // will contain the actual_value returned by the function tested
          /*
           QUnit.test("a basic test example", function ( assert ) {
           var value = "hello";
           assert.equal(value, "hello", "We expect value to be hello");
           });
           */

          QUnit.module("Testing filtering functionality");
          QUnit.asyncTest("comments stay the same", function ( assert ) {
             expect(1);
             var expected = [ 'Člověku', 'se',
                              '<', 'one', 'comment', '>',
                              '<span class = \'highlight\'>kvůli</span>',
                              'tomu,',
                              '<', 'inserted', 'comment', '>',
                              '<', 'another', 'comment', '>',
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
                "Člověku se < one comment > kvůli tomu, < inserted comment > < another comment > že přestane kouřit, zpomalí metabolismus. A to je hlavní problém, proč většině lidí začne ručička váhy ukazovat za pár měsíců o několik kilogramů více.",
                [RM.highlight_words],
                RM.simple_tokenizer, RM.simple_detokenizer,
                DS.filter_comment_remover
             ).then(function ( result ) {
                       actual = result;
                       QUnit.start();
                       assert.equal(actual, expected, ["expected :", expected, "\n returned :", actual].join(" "));
                    });
          });

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
             var filter3 = function filter3 ( text, callback ) {
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

             DS.filter_register('text', 'async_cached_postgres_highlighted_text2', filter3,
                                'srv_qry_stop_words');
             DS.filter_register_data_adapters('async_cached_postgres_highlighted_text2', 'token_action_map',
                                              dataAdapterOStore2TokenActionMap2);

             RM.apply_highlighting_filters_to_text(
                "Člověku se kvůli tomu, < inserted comment > že přestane kouřit, zpomalí metabolismus. A to je hlavní problém, proč většině lidí začne ručička váhy ukazovat za pár měsíců o několik kilogramů více.",
                [RM.highlight_words, filter3],
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

          QUnit.module("Testing note highlighting functionality", {
             setup_range : function ( range, startNode, startOffset ) {
                range.setStart(startNode, startOffset);
                range.setEnd(startNode, startOffset);
             }
          });

          QUnit.test("Getting word info from selection - from selected node to selected word ", function ( assert ) {
             // TODO : test normal cases, and edge cases, no selection, selection anchor>focus, selection focus>anchor,
             // one chracter word, caret pos before space
             // create an html content and put it in a jquery
             // then create a range where to test, add to a selection, and call the function
             var $el =
                    $("<div id='0'> <p id='3'> <span class='highlight'>Když</span> končil <span class='highlight'>projekt</span> Presseurop, <a id='4'> psali jsme </a> , že <span class='highlight'>neříkáme</span> sbohem, nýbrž „na shledanou“. </p> </div>");
             var range = document.createRange();

             /* should be TEXT_NODE Když*/
             //next sibling becuase of the space before the span tag
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.firstChild, 2);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 1,
                          'word "když" - middle position - first ancestor with id : 2 levels higher');

             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.firstChild, 0);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 1,
                          'word " když" - beginning position - first ancestor with id : 2 levels higher');

             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.firstChild, 4);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 1,
                          'word " když" - end position - first ancestor with id : 2 levels higher');

             /* should be TEXT_NODE " končil "*/
             /* selecting the space */
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 0);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 1,
                          'word končil - space before - first ancestor with id : 1 level higher');

             /* selecting the beginning of končil */
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 1);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 2,
                          'word končil - beginning position - first ancestor with id : 1 level higher');

             /* selecting the middle of končil */
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 2);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 2,
                          'word končil - middle position - first ancestor with id : 1 level higher');

             /* selecting the end of končil */
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 7);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 2,
                          'word končil - end position - first ancestor with id : 1 level higher');

             /* selecting the space at the end of končil -> take the next word if there is one but there is none*/
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 8);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 2,
                          'word končil - space at end position - first ancestor with id : 1 level higher');

             /* should be TEXT_NODE " psali jsme "*/
             /* selecting the space */
             this.setup_range(range, $("#4", $el)[0].firstChild, 0);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 0,
                          'word " psali jsme " - space at beginning position - first ancestor with id : 1 level higher');

             /* selecting the beginning of psali */
             this.setup_range(range, $("#4", $el)[0].firstChild, 1);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 1,
                          'word " psali jsme " - beginning position - first ancestor with id : 1 level higher');

             /* selecting the end of psali -> psali  */
             this.setup_range(range, $("#4", $el)[0].firstChild, 6);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 1,
                          'word " psali jsme " - end position - first ancestor with id : 1 level higher');

             /* selecting the beginning of jsme */
             this.setup_range(range, $("#4", $el)[0].firstChild, 7);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 2,
                          'word " psali jsme " - beginning position of jsme - first ancestor with id : 1 level higher');

             this.setup_range(range, $("#4", $el)[0].nextSibling, 0);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 6,
                          'word " , že " - space at beginning position - first ancestor with id : 1 level higher');

             this.setup_range(range, $("#4", $el)[0].nextSibling, 1);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 7,
                          'word " , že " - comma at beginning position - first ancestor with id : 1 level higher');

             this.setup_range(range, $("#4", $el)[0].nextSibling, 2);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 7,
                          'word " , že " - space after comma - first ancestor with id : 1 level higher');

             this.setup_range(range, $("#4", $el)[0].nextSibling, 3);
             assert.equal(TC.getWordIndexFromIDParent(undefined, undefined, range), 8,
                          'word " , že " - beginning of že- first ancestor with id : 1 level higher');

          });

          QUnit.test("Getting word info from selection - from document start to selected node", function ( assert ) {
             var $el =
                    $("<div id='0'> <p id='3'> <span class='highlight'>Když</span> končil <span class='highlight'>projekt</span> Presseurop, <a id='4'> psali jsme </a> , že <span class='highlight'>neříkáme</span> sbohem, nýbrž „na shledanou“. </p> </div>");
             $el.appendTo("body");
             //TODO add display none
             var range = document.createRange();

             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.firstChild, 2);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 1,
                          'word "Když" - middle position - first ancestor with id : 2 levels higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'Když',
                          'word "Když" - middle position - first ancestor with id : 2 levels higher');

             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.firstChild, 0);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 1,
                          'word " Když" - beginning position - first ancestor with id : 2 levels higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'Když',
                          'word " Když" - beginning position - first ancestor with id : 2 levels higher');

             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.firstChild, 4);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 1,
                          'word " Když" - end position - first ancestor with id : 2 levels higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'Když',
                          'word " Když" - end position - first ancestor with id : 2 levels higher');

             /* should be TEXT_NODE " končil "*/
             /* selecting the space */
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 0);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 1,
                          'word " končil " - space before - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'Když',
                          'word " končil " - space before - first ancestor with id : 1 level higher');

             /* selecting the beginning of končil */
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 1);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 2,
                          'word končil - beginning position - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'končil',
                          'word končil - beginning position - first ancestor with id : 1 level higher');

             /* selecting the middle of končil */
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 2);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 2,
                          'word končil - middle position - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'končil',
                          'word končil - middle position - first ancestor with id : 1 level higher');

             /* selecting the end of končil */
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 7);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 2,
                          'word končil - end position - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'končil',
                          'word končil - end position - first ancestor with id : 1 level higher');

             /* selecting the space at the end of končil -> take the next word if there is one but there is none*/
             this.setup_range(range, $("#3", $el)[0].firstChild.nextSibling.nextSibling, 8);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 2,
                          'word končil - space at end position - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'končil',
                          'word končil - space at end position - first ancestor with id : 1 level higher');

             /* should be TEXT_NODE " psali jsme "*/
             /* selecting the space */
             this.setup_range(range, $("#4", $el)[0].firstChild, 0);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 4,
                          'word " psali jsme " - space at beginning position - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'Presseurop,',
                          'word " psali jsme " - space at beginning position - first ancestor with id : 1 level higher');

             /* selecting the beginning of psali */
             this.setup_range(range, $("#4", $el)[0].firstChild, 1);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 5,
                          'word " psali jsme " - beginning position - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'psali',
                          'word " psali jsme " - beginning position - first ancestor with id : 1 level higher');

             /* selecting the end of psali -> psali  */
             this.setup_range(range, $("#4", $el)[0].firstChild, 6);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 5,
                          'word " psali jsme " - end position - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'psali',
                          'word " psali jsme " - end position - first ancestor with id : 1 level higher');

             /* selecting the beginning of jsme */
             this.setup_range(range, $("#4", $el)[0].firstChild, 7);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 6,
                          'word " psali jsme " - beginning position of jsme - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'jsme',
                          'word " psali jsme " - beginning position of jsme - first ancestor with id : 1 level higher');

             /* word , že */
             this.setup_range(range, $("#4", $el)[0].nextSibling, 0);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 6,
                          'word " , že " - space at beginning position - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'jsme',
                          'word " , že " - space at beginning position - first ancestor with id : 1 level higher');

             this.setup_range(range, $("#4", $el)[0].nextSibling, 1);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 7,
                          'word " , že " - comma at beginning position - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, ',',
                          'word " , že " - comma at beginning position - first ancestor with id : 1 level higher');

             this.setup_range(range, $("#4", $el)[0].nextSibling, 2);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 7,
                          'word " , že " - space after comma - first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, ',',
                          'word " , že " - space after comma - first ancestor with id : 1 level higher');

             this.setup_range(range, $("#4", $el)[0].nextSibling, 3);
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).index, 8,
                          'word " , že " - beginning of že- first ancestor with id : 1 level higher');
             assert.equal(TC.getNoteFromWordClickedOn(undefined, undefined, range).word, 'že',
                          'word " , že " - beginning of že- first ancestor with id : 1 level higher');

          });

          return {};
       });
