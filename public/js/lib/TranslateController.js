/**
 * Defining and instantiating translate controllers for tooltip functionality
 */
/**
 * Lessons learnt:
 * var self = this in each beginning when necessary
 * triggered event listened from document or window
 * can.trigger cannot be used for that purpose, better use $.trigger, as I can pass ev.x, ev.y
 * cam.trigger is good to generate event on specific OBJECTS (pubsub mechanism)
 * document fragment is nice to perform DOM operations with good performance
 * BUT to have it live (e.g. get dimensions for instance), necessary to display:block and insert it in body
 - if in the controller there are two identical strings matching to event handlers, only the last one is taken into account
 */

/**
 * TODO: CODE QUALITY
 * - Change name of ReaderViews to TranslateView (related to TranslateController)
 * - Establish a naming pattern for all app (and css classes etc.)
 * TODO : CODE QUALITY : factoriser tout dans ReaderViews
 nom template : tpl--... : NO!! get_view (retourne can-view)
 Ainsi le nom du template est encapsule dans RV
 div in template :  reader-tool-tooltip NO!! que ce soit une methode . RV. getReaderToolDiv -> $el
 ainsi on peut tout modifier dans view sans modifier le controlleur
 div out template : ici y'a pas vu qu'on ajoute a body NO!!!! mettre le render dans la view??
 A priori render seulement une fois, car le reste est dynamically updated
 * TODO : FEATURES
 * - !!! probably I cannot have several tooltips because I only have one adapter. Should call a new ..Adapter in the controller
 * - afficher qqch dans la tooltip en cas de rien retourné par la translation
 * - passer aux synonymes cf. wordnet
 TODO : FEATURES : remettre de l'ordre dans l'affichage des translation du tooltip
 - d'abord les phrases qui ont des translations
 - apres celle qui ont un sens à coté et pas de translation
 - apres celle qui n'ont ni sens ni translation (enlever la ligne vide...)
 TODO : FEATURES : See how to mitigate the fact that ts_lexize cspell do not find the lexeme always
 - for instance, připomněl -> připomněl
 */
define(['debug',
        'jquery',
        'mustache',
        'data_struct',
        'readerModel',
        'ReaderViews',
        'socket',
        'utils'],
       function ( DBG, $, MUSTACHE, DS, RM, RV, SOCK, UT ) {
          // logger
          var log = DBG.getLogger("TC");
          
          var TC = {};

          TC.rtTranslateView = can.view('tpl-translate-tooltip');

          TC.viewTranslateAdapter = new
             can.Map({
                        tooltip_html_content       : null,
                        display                    : 'none',
                        top                        : '10px',
                        left                       : '10px',
                        width                      : '10%',
                        height                     : '10%',
                        text_align                 : 'center',
                        get_$tooltip               : function () {return $("#airlang-rdt-tt")},
                        get_$translation_table     : function () {return $("#table_tooltip");},
                        id_trans_input             : 'airlang-rdt-trans-input',
                        // or could be $('[data-content="translation_table"]'); but it is slower so not used here
                        set_HTML_tooltip           : function ( html_text ) {
                           this.attr("tooltip_html_content", html_text)
                        },
                        empty_HTML_tooltip         : function () {this.set_HTML_tooltip("")},
                        set_display                : function ( attribute_value ) {
                           this.attr("display", attribute_value);
                        },
                        show                       : function () {this.set_display("block")},
                        hide                       : function () {this.set_display("none")},
                        is_visible                 : function () {return this.display === 'block'},
                        set_input_text             : function ( text ) {
                           $('#' + this.id_trans_input).val(text);
                        },
                        empty_input_text           : function ( text ) {
                           this.set_input_text("");
                        },
                        get_input_text             : function () {
                           return $('#' + this.id_trans_input).val().trim();
                        },
                        get_translation_clicked_on : function ( ev ) {
                           var $tr = $(ev.target).closest('tr');
                           var $tr_next_1st_child, $tr_1st_child = null;
                           var translation_word, sample_sentence_first_lg,
                               sample_sentence_target_lg, lemma_target_lg = null;
                           /* this row could be one of four possibilities:
                            1. nothing
                            2. the header row which contains the transation_lemma word
                            3. the row with the translation
                            4. the row with the sample sentences
                            */
                           switch ($tr.data('content')) {
                              case 'translation': // Case 3
                                 translation_word = $tr.data('lemma').trim();
                                 $tr_next_1st_child = $tr.next().children(0);
                                 sample_sentence_first_lg = $tr_next_1st_child.data('content-sentence-first-lg').trim();
                                 sample_sentence_target_lg =
                                 $tr_next_1st_child.data('content-sentence-target-lg').trim();
                                 lemma_target_lg = $tr.closest('table').find('th').html().trim()
                                 break;
                              case 'sample_sentences': // Case 4
                                 translation_word = $tr.prev().data('lemma').trim();
                                 $tr_1st_child = $tr.children(0);
                                 sample_sentence_first_lg = $tr_1st_child.data('content-sentence-first-lg').trim();
                                 sample_sentence_target_lg = $tr_1st_child.data('content-sentence-target-lg').trim();
                                 lemma_target_lg = $tr.closest('table').find('th').html().trim();
                                 break;
                              default: // Case 1 and 2 and whatever
                                 translation_word = this.get_input_text();
                                 lemma_target_lg = this.get_$translation_table().find('th').html().trim();
                                 break;
                           }
                           return {
                              translation_word          : translation_word,
                              sample_sentence_first_lg  : sample_sentence_first_lg,
                              sample_sentence_target_lg : sample_sentence_target_lg,
                              lemma_target_lg           : lemma_target_lg
                           }
                        }
                     });

          // The controller will manage mousestop event and tooltip display and dismissal
          // Options :
          // dismiss_on : enum(mousemove, click, escape-key) -> event which dismissed/hide the tooltip
          // translate_by : enum(point, click) -> show the tooltip by pointing the mouse on the word or clicking on it
          TC.TranslateRTController = can.Control.extend
          (//static property of control is first argument
             { defaults : {dismiss_on : 'mousemove'} },
             {
                init : function ( $el, options ) {
                   var self = this;
                   this.element.append(TC.rtTranslateView(TC.viewTranslateAdapter));
                   this.$tooltip = TC.viewTranslateAdapter.get_$tooltip();
                   this.stateMap = {
                      $rdt_el  : this.options.target,
                      objTrans : {
                         translation_word          : null,
                         sample_sentence_first_lg  : null,
                         sample_sentence_target_lg : null,
                         lemma_target_lg           : null}
                   };
                },

                '{target} al-ev-show_tooltip' : function ( $el, ev ) {
                   log.event( "al-ev-show_tooltip", "received");
                   this.process(ev, this.$tooltip, this.options);
                   return false;
                },

                '{window} keydown' : function ( $el, ev ) {
                   var self = this;
                   log.debug( "keydown event", ev.keyCode);
                   log.debug("target event", ev.target.getAttribute('id'));
                   log.debug("visible tooltip", TC.viewTranslateAdapter.is_visible());

                   if (ev.keyCode === 13) {
                      if (TC.viewTranslateAdapter.is_visible()) {
                         self.submit($el, ev, true); // submit done through enter key
                      }
                   }

                   if (ev.keyCode === 27 && self.options.dismiss_on === 'escape-key') {
                      if (TC.viewTranslateAdapter.is_visible()) {
                         self.dismiss_and_return({translation_word : null});
                      }
                   }

                   return true;
                },

                'click' : function ( $el, ev ) {
                   var self = this;

                   var objTrans = TC.viewTranslateAdapter.get_translation_clicked_on(ev);
                   if (!objTrans) {
                      return false;
                   } // click out of the translation table
                   TC.viewTranslateAdapter.set_input_text(objTrans.translation_word);
                   this.stateMap.objTrans = objTrans;
                },

                submit : function ( $el, ev, enterKey ) {
                   var self = this;
                   // check event target
                   // should be #airlang-rdt-trans-input
                   if (ev.target.getAttribute('id') !== TC.viewTranslateAdapter.id_trans_input && !enterKey) {
                      return true;
                   }

                   log.event( 'submit', 'received on element', '#' + ev.target.getAttribute('id'));
                   var translation_word = this.stateMap.objTrans.translation_word;
                   if (!translation_word) {
                      this.stateMap.objTrans = TC.viewTranslateAdapter.get_translation_clicked_on(ev);
                   }

                   // Dismiss the tooltip and return the translation of the word
                   this.dismiss_and_return(this.stateMap.objTrans);
                },

                resize : function ( tt ) {
                   tt.height(tt.contents().height());
                   tt.width(tt.contents().width() + 10);
                },

                dismiss_and_return : function ( return_object ) {
                   this.empty_and_hide();
                   log.event( "al-ev-tooltip_dismiss", "emitting");
                   this.stateMap.$rdt_el.trigger(UT.create_jquery_event("al-ev-tooltip_dismiss",
                                                                        return_object));
                },

                empty_and_hide : function () {
                   TC.viewTranslateAdapter.empty_HTML_tooltip();
                   TC.viewTranslateAdapter.hide();
                },

                getHitWord : function ( e ) {

                   function restorable ( node, do_stuff ) {
                      $(node).wrap('<transwrapper />');
                      var res = do_stuff(node);
                      $('transwrapper').replaceWith(UT.escape_html($('transwrapper').text()));
                      return res;
                   }

                   function getExactTextNode ( nodes, e ) {
                      $(text_nodes).wrap('<transblock />');
                      var hit_text_node = document.elementFromPoint(e.clientX, e.clientY);

                      //means we hit between the lines
                      if (hit_text_node.nodeName != 'TRANSBLOCK') {
                         $(text_nodes).unwrap();
                         return null;
                      }

                      hit_text_node = hit_text_node.childNodes[0];

                      $(text_nodes).unwrap();

                      return hit_text_node;
                   }

                   log.entry("getHitWord");
                   var hit_elem = $(document.elementFromPoint(e.clientX, e.clientY));
                   var word_re = "\\p{L}{2,}";
                   var parent_font_style = {
                      'line-height' : hit_elem.css('line-height'),
                      'font-size'   : '1em',
                      'font-family' : hit_elem.css('font-family')
                   };

                   var text_nodes = hit_elem.contents().filter(function () {
                      return this.nodeType == Node.TEXT_NODE && XRegExp(word_re).test(this.nodeValue)
                   });

                   if (text_nodes.length == 0) {
                      log.debug( 'no text');
                      logExit("getHitWord");
                      return '';
                   }

                   var hit_text_node = getExactTextNode(text_nodes, e);
                   if (!hit_text_node) {
                      log.debug( 'hit between lines');
                      log.exit("getHitWord");
                      return '';
                   }

                   var hit_word = restorable(hit_text_node, function ( node ) {
                      var hw = '';

                      function getHitText ( node, parent_font_style ) {
                         log.debug( "getHitText: '" + node.textContent + "'");

                         if (XRegExp(word_re).test(node.textContent)) {
                            $(node).replaceWith(function () {
                               return this.textContent.replace(XRegExp("^(.{" +
                                                                       Math.round(node.textContent.length / 2) +
                                                                       "}\\p{L}*)(.*)", 's'), function ( $0, $1, $2 ) {
                                  return '<transblock>' + UT.escape_html($1) + '</transblock><transblock>' +
                                         UT.escape_html($2) + '</transblock>';
                               });
                            });

                            $('transblock').css(parent_font_style);

                            var next_node = document.elementFromPoint(e.clientX, e.clientY).childNodes[0];

                            if (next_node.textContent == node.textContent) {
                               return next_node;
                            }
                            else {
                               return getHitText(next_node, parent_font_style);
                            }
                         }
                         else {
                            return null;
                         }
                      }

                      var minimal_text_node = getHitText(hit_text_node, parent_font_style);

                      if (minimal_text_node) {
                         //wrap words inside text node into <transover> element
                         $(minimal_text_node).replaceWith(function () {
                            return this.textContent.replace(XRegExp("(<|>|&|\\p{L}+)", 'g'), function ( $0, $1 ) {
                               switch ($1) {
                                  case '<':
                                     return "&lt;";
                                  case '>':
                                     return "&gt;";
                                  case '&':
                                     return "&amp;";
                                  default:
                                     return '<transover>' + $1 + '</transover>';
                               }
                            });
                         });

                         $('transover').css(parent_font_style);

                         //get the exact word under cursor
                         var hit_word_elem = document.elementFromPoint(e.clientX, e.clientY);

                         //no word under cursor? we are done
                         if (hit_word_elem.nodeName != 'TRANSOVER') {
                            log.debug( "missed!");
                         }
                         else {
                            hw = $(hit_word_elem).text();
                            log.debug( "got it: " + hw);
                         }
                      }

                      return hw;
                   });

                   log.info( "Word found: ", hit_word);
                   logExit("getHitWord");
                   return hit_word;
                },

                process : function ( e, tooltip, options ) {

                   var self = this; //store reference to controller instance object

                   var selection = window.getSelection();
                   var hit_elem = document.elementFromPoint(e.clientX, e.clientY);

                   //don't mess around with html inputs
                   if (/INPUT|TEXTAREA/.test(hit_elem.nodeName)) {
                      return;
                   }

                   //and editable divs
                   if (hit_elem.getAttribute('contenteditable') == 'true' ||
                       $(hit_elem).parents('[contenteditable=true]').length > 0) {
                      return;
                   }

                   var word = '';
                   if (selection.toString()) {

                      log.debug( 'Got selection: ' + selection.toString());

                      var sel_container = selection.getRangeAt(0).commonAncestorContainer;

                      while (sel_container.nodeType != Node.ELEMENT_NODE) {
                         sel_container = sel_container.parentNode;
                      }

                      if (// only choose selection if mouse stopped within immediate parent of selection
                         ( $(hit_elem).is(sel_container) || $.contains(sel_container, hit_elem) )
                         // and since it can still be quite a large area
                         // narrow it down by only choosing selection if mouse points at the element that is (partially) inside selection
                         && selection.containsNode(hit_elem, true)
                      // But what is the point for the first part of condition? Well, without it, pointing at body for instance would also satisfy the second part
                      // resulting in selection translation showing up in random places
                         ) {
                         word = selection.toString();
                      }
                      else if (options.translate_by == 'point') {
                         word = self.getHitWord(e);
                      }
                   }
                   else {
                      word = self.getHitWord(e);
                   }
                   if (word != '') {
                      // display the tooltip with the translation
                      self.show_translation(word, e);
                   }
                },

                show_translation : function ( word, ev ) {
                   log.info( "Fetching translation for :", word);

                   var self = this;
                   RM.cached_translation(word, function ( err, aValues ) {
                      vValues = aValues;
                      if (err) {
                         log.error( "An error ocurred", err);
                         return null;
                      }
                      if (aValues.length === 0) { // means server returned empty
                         log.warning( "Query did not return any values");
                         // dismiss the tooltip (invisible but still capting events away from other controllers
                         return null;
                      }

                      log.info( "Translation fetched");

                      // Get table html text which contains the translation of the word
                      var html_text = self.formatTranslationResults(aValues);

                      // get the height and width of the rendered table
                      // we have to render the table first to get the dimensions
                      // to that purpose we use a fragment that we display to get dimensions and then undisplay
                      var frag = UT.fragmentFromString(html_text);
                      self.$tooltip.append(frag);
                      TC.viewTranslateAdapter.set_HTML_tooltip("");
                      TC.viewTranslateAdapter.set_input_text("");
                      TC.viewTranslateAdapter.set_display("block");
                      var $$tbl = TC.viewTranslateAdapter.get_$translation_table();
                      var width = $$tbl.width();
                      var height = $$tbl.height();
                      var pos = self.compute_position(ev.clientX, ev.clientY, $$tbl);
                      TC.viewTranslateAdapter.set_display("none");
                      $$tbl.remove();
                      //log.debug( "HTML formatting :", html_text);

                      TC.viewTranslateAdapter.set_HTML_tooltip(html_text);
                      TC.viewTranslateAdapter.show();
                      TC.viewTranslateAdapter.attr("left", [pos.x, 'px'].join(""));
                      TC.viewTranslateAdapter.attr("top", [pos.y, 'px'].join(""));
                      TC.viewTranslateAdapter.attr("width", [width, 'px'].join(""));
                      TC.viewTranslateAdapter.attr("height", [height, 'px'].join(""));

                      // send the shown_tooltip event to alert all controllers of the state
                      self.element.trigger(UT.create_jquery_event('al-ev-shown_tooltip'));
                      log.debug( "displaying tooltip");
                   });
                },

                compute_position : function ( x, y, tt, ttOuterWidth, ttOuterHeight ) {
                   var pos = {};
                   var margin = 5;
                   var anchor = 10;

                   // show popup to the right of the word if it fits into window this way
                   if (x + anchor + tt.outerWidth(true) + margin < $(window).width()) {
                      pos.x = x + anchor;
                   }
                   // show popup to the left of the word if it fits into window this way
                   else if (x - anchor - tt.outerWidth(true) - margin > 0) {
                      pos.x = x - anchor - tt.outerWidth(true);
                   }
                   // show popup at the very left if it is not wider than window
                   else if (tt.outerWidth(true) + margin * 2 < $(window).width()) {
                      pos.x = margin;
                   }
                   // resize popup width to fit into window and position it the very left of the window
                   else {
                      var non_content_x = tt.outerWidth(true) - tt.width();

                      tt.width($(window).width() - margin * 2 - non_content_x);
                      tt.height(tt.contents().height() + 4);

                      pos.x = margin;
                   }

                   // show popup above the word if it fits into window this way
                   if (y - anchor - tt.outerHeight(true) - margin > 0) {
                      pos.y = y - anchor - tt.outerHeight(true);
                   }
                   // show popup below the word if it fits into window this way
                   else if (y + anchor + tt.outerHeight(true) + margin < $(window).height()) {
                      pos.y = y + anchor;
                   }
                   // show popup at the very top of the window
                   else {
                      pos.y = margin;
                   }

                   return pos;
                },

                formatTranslationResults : function ( aValues ) {
                   /**
                    * aValues is the direct result of the query queryGetTranslationInfo (server-side), each object has format
                    * SELECT DISTINCT pglemmatranslationcz.translation_lemma," +
                    "pglemmatranslationcz.translation_sense, " +
                    "pglemmaen.lemma_gram_info, pglemmaen.lemma, " +
                    "pglemmaen.sense, pglemmatranslationcz.translation_gram_info, " +
                    "example_sentence_from, " +
                    "example_sentence_to, " +
                    "pgwordfrequency_short.freq_cat "
                    */

                   log.debug("aValues:", aValues);
                   const MAX_TRANSLATION_ROWS = 9;
                   const EXAMPLE_SENTENCE_TO_SEP = '|';

                   // First process example_sentence_to to replace | with line breaks
                   aValues.forEach(function ( row_value ) {
                      row_value && row_value.example_sentence_to &&
                      (row_value.example_sentence_to =
                       row_value.example_sentence_to.replace(EXAMPLE_SENTENCE_TO_SEP, '<br/>'));
                   });

                   function str_empty_if_null ( str ) {
                      return (str === null) ? "" : str;
                   }

                   // Then process example_sentence_from to replace null with ""
                   // And set the break between sentences from and to when need be
                   aValues.forEach(function ( row_value ) {
                      row_value.example_sentence_from = str_empty_if_null(row_value.example_sentence_from);
                      row_value.example_sentence_from_sep = row_value.example_sentence_from ? '<br/>' : '';
                   });
                   var aValuesReduced = TC.reduce_lemma_translations(aValues);
                   // Now put the lines with a sample sentence first
                   var aValuesSampleFirst = [];
                   aValuesReduced.forEach(function ( rowValues, index ) {
                      if (rowValues.example_sentence_from) {
                         // in aValuesSampleFirst, put lines with sentences, and remove them from aValuesReduced
                         aValuesSampleFirst.push(rowValues);
                         delete aValuesReduced[index];
                      }
                   });
                   // then add the remaining lines in aValuesReduced to aValuesSampleFirst
                   aValuesReduced.forEach(function ( rowValues, index ) {
                      if (rowValues) {
                         aValuesSampleFirst.push(rowValues);
                      }
                   });
                   // Now limit to X rows
                   var aValuesTruncated = aValuesSampleFirst.filter(function ( rowValues, index ) {
                      return index < MAX_TRANSLATION_ROWS
                   });

                   var html_text = MUSTACHE.render(RV.translation_template,
                                                   {result_rows : aValuesTruncated, translation_lemma : aValuesTruncated[0].translation_lemma});
                   //log.debug( "html_text", html_text);
                   return html_text;
                }

             });

          TC.reduce_lemma_translations = function reduce_lemma_translations ( aValues ) {
             // aggregate different translations into groups of TRANS_GROUP_SIZE, separated by SENSE_SEP
             const PREFIX_CHAR = "%";
             const TRANS_GROUP_SIZE = "3";
             const SENSE_SEP = "<br/>";
             var mapTranslations = {};

             function add_if_not_empty (source, add_str){
                return source? (source + add_str) : '';
             }

             //check input parameters
             if (!aValues) {
                log.error( "reduce_lemma_translations : passed a null object aValues - ignoring");
                return null;
             }

             // create a double map
             aValues.forEach(function ( rowValue ) {
                mapTranslations[rowValue.lemma] = mapTranslations[rowValue.lemma] || {};
                var currLemma = mapTranslations[rowValue.lemma];
                rowValue.sense = rowValue.sense || ""; // to avoid null values
                var sense_prefix = (rowValue.example_sentence_from && rowValue.example_sentence_from.trim() )
                   ? PREFIX_CHAR : "";
                currLemma[sense_prefix + rowValue.sense] = rowValue;
             });
             // Duplicate values already eliminated by virtue of the map
             var aLemmas = Object.keys(mapTranslations);
             var aLemmasRowsValue = [];
             aLemmas.forEach(function ( lemma, l_index ) {
                aLemmasRowsValue[l_index] = [];
                var aSenses = Object.keys(mapTranslations[lemma]);
                // copy the rowValues to an array in the corresponding index
                aSenses.forEach(function ( sense ) {sense.rowValue = mapTranslations[lemma][sense];});

                if (aSenses.length === 0) { // cannot be empty by construction
                   throw "reduce_lemma_translations : no sense for lemma " + lemma;
                }
                if (aSenses.length === 1) {
                   aLemmasRowsValue[l_index].push(mapTranslations[lemma][aSenses[0]]);
                   return;
                }
                var index_grp;
                var change_grp_index = true,
                    grp_size = -1;
                var curr_rowV_index;
                aSenses.forEach(function ( sense, s_index ) {
                   // Case lemma, sense, example_sentence_from with the latter not empty
                   if (mapTranslations[lemma][sense].sense.charAt(0) === PREFIX_CHAR) {return;}
                   // case with several senses for same lemma and no example sentences
                   // Group them
                   grp_size = grp_size + 1;
                   var remainder = grp_size % TRANS_GROUP_SIZE;
                   if (!(remainder)) {
                      return curr_rowV_index = aLemmasRowsValue[l_index].push(mapTranslations[lemma][sense]) - 1;
                   }
                   else {
                      // remove the translation sense info as there are now several and they could be contradictory
                      // one could also concatenate them, maybe later
                      aLemmasRowsValue[l_index][curr_rowV_index].translation_sense = "";
                      aLemmasRowsValue[l_index][curr_rowV_index].sense =
                      (add_if_not_empty(aLemmasRowsValue[l_index][curr_rowV_index].sense, SENSE_SEP) + sense)
                         .replace(PREFIX_CHAR, '');
                   }
                });
             });
             // now aLemmas should have for each lemma the list of senses in rowsValue
             var aValuesReduced = [];
             aLemmasRowsValue.forEach(function ( _aLemmasRowsValue ) {
                _aLemmasRowsValue.forEach(function flatmap ( lemmaRowValue ) {aValuesReduced.push(lemmaRowValue);})
             });
             return aValuesReduced;
             // now group the lemmas
             // TODO
          };

          return TC;
       })
;
