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

          QUnit.asyncTest("two filters", function ( assert ) {
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
             var srv_qry_stop_words = function srv_qry_stop_words ( text, callback ) {
                /*
                 Words: the words to question the server with
                 callback: executed when the server has finished its processing
                 */
                if (text.indexOf("Člověku") >= 0) {
                   text = text.replace("Člověku", "<span class = 'highlight'>Člověku</span>");
                }
                console.log("text stop words", text);
                return text;
             };
             DS.filter_register('text', 'async_cached_postgres_highlighted_text', srv_qry_stop_words,
                                'srv_qry_stop_words');

             RM.apply_highlighting_filters_to_text(
                "Člověku se kvůli tomu, < inserted comment > že přestane kouřit, zpomalí metabolismus. A to je hlavní problém, proč většině lidí začne ručička váhy ukazovat za pár měsíců o několik kilogramů více.",
                [RM.highlight_words, srv_qry_stop_words],
                RM.simple_tokenizer, RM.simple_detokenizer
             ).then(function ( actual ) {
                       QUnit.start();
                       assert.equal(actual, expected, ["expected :", expected, "\n returned :", actual].join(" "));
                    });
          });

          var t_RM = {};
          return t_RM;
       });
