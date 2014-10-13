/**
 * Created by bcouriol on 9/10/14.
 */
define(['ReaderModel', 'data_struct'],
       function ( RM, DS ) {
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
                RM.simple_tokenizer, RM.simple_detokenizer
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
                RM.simple_tokenizer, RM.simple_detokenizer
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

             var dataAdapterOStore2TokenActionMap2 = function dataAdapterOStore2TokenActionMap2 (aStore) {
                function fn_html_highlight ( token ) {
                   return [StartSel, token, StopSel].join("");
                }
                var StartSel = "<span class = 'highlight2'>";
                var StartSel_nospaces = StartSel.replace(/ /g, "_");
                var  StopSel = "</span>";
                var  StopSel_nospaces = StopSel.replace(/ /g, "_");
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
                RM.simple_tokenizer, RM.simple_detokenizer
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

          var t_RM = {};
          return t_RM;
       });
