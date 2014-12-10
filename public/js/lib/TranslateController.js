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
define(['jquery',
        'mustache',
        'data_struct',
        'ReaderModel',
        'ReaderViews',
        'utils'],
       function ( $, MUSTACHE, DS, RM, RV, UT ) {

          var TC = {};

          TC.rtTranslateView = can.view('tpl-translate-tooltip');

          TC.viewTranslateAdapter = new
             can.Map({
                        tooltip_html_content : null,
                        display              : 'none',
                        top                  : '10px',
                        left                 : '10px',
                        width                : '10%',
                        height               : '10%',
                        text_align           : 'center',
                        set_HTML_tooltip     : function ( html_text ) {
                           this.attr("tooltip_html_content", html_text)
                        },
                        set_display          : function ( attribute_value ) {
                           this.attr("display", attribute_value);
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
                   logWrite(DBG.TAG.INFO, "initializing tooltip with options", UT.inspect(options));
                   var self = this;
                   $("body").append(TC.rtTranslateView(TC.viewTranslateAdapter));
                   this.$tooltip = $("#airlang-rdt-tt");
                },

                $tooltip        : null,
                last_mouse_stop : {x : 0, y : 0},
                timer25         : null,

                '{document} mousestop' : function ( $el, ev ) {
                   if (this.options.translate_by != 'point') {
                      return true;
                   }
                   this.process(ev, this.$tooltip, this.options);
                },
                'click'                : function click ( $el, ev ) {
                   if (this.options.translate_by != 'click') {
                      return true; // bubble to another element who might process it
                   }
                   else {
                      logEntry('Translate : click');
                      this.process(ev, this.$tooltip, this.options);
                      return false; // don't bubble the click, we dealt with it here
                      logExit('Translate : click');
                   }
                },
                'mousemove'            : function ( $el, ev ) {
                   var self = this;
                   if (this.hasMouseReallyMoved(ev)) {
                      var mousemove_without_noise = new $.Event('mousemove_without_noise');
                      mousemove_without_noise.clientX = ev.clientX;
                      mousemove_without_noise.clientY = ev.clientY;

                      // trigger that event on the whole div container. The $el here is not used
                      // but necessary to get access to the ev parameter
                      self.element.trigger(mousemove_without_noise);
                   }
                },

                '{document} mousemove_without_noise' : function ( $el, ev ) {
                   var self = this;
                   clearTimeout(this.timer25);
                   var delay = 300;
                   this.timer25 = setTimeout(function () {
                      var mousestop = new $.Event("mousestop");
                      self.last_mouse_stop.x = mousestop.clientX = ev.clientX;
                      self.last_mouse_stop.y = mousestop.clientY = ev.clientY;

                      self.element.trigger(mousestop);
                   }, delay);
                },

                '{window} keydown'  : function ( $el, ev ) {
                   logWrite(DBG.TAG.DEBUG, "keydown event", ev.keyCode);
                   if (ev.keyCode == 27 && this.options.dismiss_on == 'escape-key') {
                      this.empty_and_hide();
                   }
                },

                hasMouseReallyMoved : function ( e ) { //or is it a tremor?
                   var left_boundry = parseInt(this.last_mouse_stop.x) - 5,
                      right_boundry = parseInt(this.last_mouse_stop.x) + 5,
                      top_boundry = parseInt(this.last_mouse_stop.y) - 5,
                      bottom_boundry = parseInt(this.last_mouse_stop.y) + 5;
                   return e.clientX > right_boundry || e.clientX < left_boundry || e.clientY > bottom_boundry ||
                          e.clientY < top_boundry;
                },

                resize : function ( tt ) {
                   tt.height(tt.contents().height());
                   tt.width(tt.contents().width() + 10);
                },

                empty_and_hide : function () {
                   TC.viewTranslateAdapter.set_HTML_tooltip("");
                   TC.viewTranslateAdapter.set_display("none");
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

                   logEntry("getHitWord");
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
                      logWrite(DBG.TAG.DEBUG, 'no text');
                      logExit("getHitWord");
                      return '';
                   }

                   var hit_text_node = getExactTextNode(text_nodes, e);
                   if (!hit_text_node) {
                      logWrite(DBG.TAG.DEBUG, 'hit between lines');
                      logExit("getHitWord");
                      return '';
                   }

                   var hit_word = restorable(hit_text_node, function ( node ) {
                      var hw = '';

                      function getHitText ( node, parent_font_style ) {
                         logWrite(DBG.TAG.DEBUG, "getHitText: '" + node.textContent + "'");

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
                            logWrite(DBG.TAG.DEBUG, "missed!");
                         }
                         else {
                            hw = $(hit_word_elem).text();
                            logWrite(DBG.TAG.DEBUG, "got it: " + hw);
                         }
                      }

                      return hw;
                   });

                   logWrite(DBG.TAG.INFO, "Word found: ", hit_word);
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

                      logWrite(DBG.TAG.DEBUG, 'Got selection: ' + selection.toString());

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

                      // set the mousemove event handler for dismissing tooltip (window scroll and mousemove)
                      if (self.options.dismiss_on == 'mousemove') {
                         self.element.on('mousemove_without_noise', self.empty_and_hide);
                         $(window).scroll(self.empty_and_hide);
                      }
                   }
                },

                show_translation : function ( word, ev ) {
                   //TODO: no function show on tooltip...tooltip_html_content
                   // basically, put the param here in {{}} and modify them, handle resize separately
                   // how to debug!!!
                   logWrite(DBG.TAG.INFO, "Fetching translation for :", word);

                   var self = this;
                   RM.cached_translation(word, function ( err, aValues ) {
                      var aQuery_result = aValues[0];
                      if (err) {
                         logWrite(DBG.TAG.ERROR, "An error ocurred", err);
                         return null;
                      }
                      if (aValues.length === 0 || // means nothing was returned from server and put in store
                          aQuery_result.length === 0) { // means server returned empty
                         logWrite(DBG.TAG.WARNING, "Query did not return any values");
                         return null;
                      }

                      logWrite(DBG.TAG.INFO, "Translation fetched");

                      // Get table html text which contains the translation of the word
                      var html_text = self.formatTranslationResults(aQuery_result);

                      // get the height and width of the rendered table
                      // we have to render the table first to get the dimensions
                      // to that purpose we use a fragment that we display to get dimensions and then undisplay
                      var frag = UT.fragmentFromString(html_text);
                      self.$tooltip.append(frag);
                      TC.viewTranslateAdapter.set_HTML_tooltip("");
                      TC.viewTranslateAdapter.set_display("block");
                      var $$tbl = $("#table_tooltip");
                      var width = $$tbl.width();
                      var height = $$tbl.height();
                      var pos = self.compute_position(ev.clientX, ev.clientY, $$tbl);
                      TC.viewTranslateAdapter.set_display("none");
                      $$tbl.remove();
                      //logWrite(DBG.TAG.DEBUG, "HTML formatting :", html_text);

                      TC.viewTranslateAdapter.set_HTML_tooltip(html_text);
                      TC.viewTranslateAdapter.set_display("block");
                      TC.viewTranslateAdapter.attr("left", [pos.x, 'px'].join(""));
                      TC.viewTranslateAdapter.attr("top", [pos.y, 'px'].join(""));
                      TC.viewTranslateAdapter.attr("width", [width, 'px'].join(""));
                      TC.viewTranslateAdapter.attr("height", [height, 'px'].join(""));

                      logWrite(DBG.TAG.DEBUG, "displaying tooltip");
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
                   logEntry("formatTranslationResults");
                   var html_text = MUSTACHE.render(RV.translation_template,
                                                   {result_rows : aValues, translation_lemma : aValues[0].translation_lemma});
                   //logWrite(DBG.TAG.DEBUG, "html_text", html_text);
                   logExit("formatTranslationResults");
                   return html_text;
                }

             });

          /**
           * Purpose    : return a note object containing the word and positional information about the word being clicked on
           * ASSUMPTION : function called from within a container such as returned by the parseDomTree function
           *              i.e. with numbered html tag except for text nodes
           * @param {jQuery} $el : jQuery element clicked on (target element)
           * @param {event} ev  : event object
           * @param {range} selectedRange range containing the click selection made by the user
           */
          TC.getNoteFromWordClickedOn = function getNoteFromWordClickedOn ( $el, ev, selectedRange ) {
             // count the number of words to the first element with ID

             // Two cases, the anchor object has an id property or it does not. Most of the time it won't
             var startNode = selectedRange.startContainer,
                firstIDNode = TC.findParentWithId(startNode),
             // Beware that the first character of textContent can be a space because of the way we construct the html of the page

                parent_node_with_id = TC.findParentWithId(startNode),
                id_of_parent_node_with_id = parent_node_with_id.getAttribute("id"),

                rootNode = document.getElementById("0");
             if (!rootNode) {
                throw 'getNoteFromWordClickedOn: no element with id="0" - this function can only be called on a DOM parsed with parseDOMTree '
             }

             // NOTE TODO :: Solve the dependence introduced with the parseDOMTree function
             // if at some point the id changes in parseDomTree, it has to be updated here too
             var aDomNodes = UT.traverse_DOM_depth_first("===", rootNode, firstIDNode);

             // remove the startNode as we do not wish to count the words in it
             if (!aDomNodes.pop()) {
                // if for some reason there is no nodes returned by the traversal, throw an error
                // there should always one node by construction, the rootNode
                // TODO: test the edge case if rootnode = startnode in which case there is no words (0) to count
                // in that case the array is empty, the map leaves it empty and the reduce gives 0
                // BECAUSE I set 0 as initial value, otherwise error
                throw 'getNoteFromWordClickedOn: internal error? traverse_DOM_depth_first returns an empty array!'
             }

             var word_index_to_selected_node = aDomNodes
                // first for each node get the number of words in the node
                .map(function ( node ) {
                        return (node.nodeType === node.TEXT_NODE)
                           //returns number of words in the text node. "" does not count for a word
                           ? RM.simple_tokenizer(node.textContent).map(UT.count_word).reduce(UT.sum, 0)
                           // not a text node so no words to count here
                           : 0;
                     })
                // the sum all those numbers
                .reduce(UT.sum, 0);

             // now calculate the number of words from selected node to selected word
             var word_index_to_selected_word = TC.getWordIndexFromIDParent($el, ev, selectedRange);

             // get selected word from the index
             var full_text = rootNode.textContent;
             if (!full_text) {
                // that should never happen right?
                // we let it slip and let the caller decide what to do
                return {word : null, index : null, context_sentence : null, rootNode : null}
             }
             var final_index = word_index_to_selected_node + word_index_to_selected_word;

             return RM.get_note_from_param(full_text, final_index, rootNode);
          };

          /**
           *
           * @param startNode {Node}
           * @returns {Node}
           * @throws {Exception} throws 'findParentWithId: could not find a node with an ID...'
           */
          TC.findParentWithId = function findParentWithId ( startNode ) {
             // Find an ancestor node to startNode with an attribute id
             var currentNode = startNode;
             var ancestor_level = 0;
             while (currentNode &&
                    (currentNode.nodeType === currentNode.TEXT_NODE || !currentNode.getAttribute("id") )) {
                logWrite(DBG.TAG.DEBUG, "no id found, looking higher up");
                currentNode = currentNode.parentNode;
                ancestor_level++;
             }
             if (currentNode === null) {
                // we reached the top of the tree and we found no node with an attribute ID...
                throw 'findParentWithId: could not find a node with an ID...'
             }

             logWrite(DBG.TAG.DEBUG,
                      "found id in parent " + ancestor_level + " level higher : " + currentNode.getAttribute("id"));
             return currentNode;
          };

          /**
           * Purpose    : return the word index from the first parent element with an existing attribute ID
           * ASSUMPTION : function called from within a container such as returned by the parseDomTree function
           *              i.e. with numbered html tag except for text nodes
           * @param {jQuery} $el : jQuery element clicked on (target element)
           * @param {event} ev  : event object
           * @param {range} selectedRange range containing the click selection made by the user
           * @returns {number} index of word (starting with 1) from parent with an existing attribute ID
           * TODO : treat the case where startNode is not a text node : as this is a click, it should always be the case
           *          unless we click on a tag (is that possible? on an image for instance? what if there is a selection before the click?
           */
          TC.getWordIndexFromIDParent = function getWordIndexFromIDParent ( $el, ev, selectedRange ) {

             //var selectedRange = window.getSelection().getRangeAt(0);
             // if it is just a click, then anchor and focus point to the same location
             // but that means there is no selection having been done previously
             // For the moment we just deal with anchor

             // Two cases, the anchor object has an id property or it does not. Most of the time it won't
             var startNode = selectedRange.startContainer;
             var startOffset = selectedRange.startOffset;
             var textContent = startNode.textContent;
             // Beware that the first character of textContent can be a space because of the way we construct the html of the page

             logWrite(DBG.TAG.DEBUG, "start node", startNode.nodeName, textContent, "offset", startOffset);

             // Init array variables tracing the counting
             var aCharLengths = [],
                aWordLengths = [];

             // get the first parent with id
             var currentNode = TC.findParentWithId(startNode);

             // traverse tree till startNode and count words and characters while doing so
             count_word_and_char_till_node(currentNode, startNode, aCharLengths, aWordLengths, RM.simple_tokenizer);

             logWrite(DBG.TAG.DEBUG, "found startNode", aCharLengths.reduce(UT.sum, 0), aWordLengths.reduce(UT.sum, 0));

             count_word_and_char_till_offset(startNode, aCharLengths, aWordLengths, RM.simple_tokenizer);

             //finished! Now count the number of words we have skipped to reach the final one and the chars
             selectedRange.detach();

             return aWordLengths.reduce(UT.sum, 0);

             ////// Helper functions
             function count_word_and_char_till_node ( currentNode, startNode, /*OUT*/aCharLengths, /*OUT*/aWordLengths,
                                                      tokenizer ) {
                // tokenizer is passed here as a parameter because I need to use the same tokenizer that gave me the token array when highlighting previously
                if (!currentNode.isEqualNode(startNode)) {
                   // by construction, currentNode cannot be a TEXT_NODE the first time, as ancestor node have an ID
                   // and text node cannot have id
                   if (currentNode.nodeType === currentNode.TEXT_NODE) {
                      logWrite(DBG.TAG.DEBUG, "process text node from", currentNode.nodeName);
                      var text_content = currentNode.textContent;
                      var text_content_trim = text_content.trim();
                      var aWords = tokenizer(text_content_trim);
                      aCharLengths.push(text_content.length);

                      if (text_content_trim) {
                         logWrite(DBG.TAG.DEBUG, "non empty string: adding to word array");
                         // if text_content is only spaces, there is no words to count!!
                         aWordLengths.push(aWords.length);
                      }
                      return false;
                   }
                   else {
                      // otherwise we have an element node, which do not have a text, just proceed to the next child
                      if (!currentNode.hasChildNodes()) {
                         throw "count_word_and_char_till_node: children nodes not found and we haven't reached the startNode!! Check the DOM, this is impossible";
                      }
                      logWrite(DBG.TAG.DEBUG, "process children of node", currentNode.nodeName, "number of children",
                               currentNode.childNodes.length);
                      var nodeChildren = currentNode.childNodes;
                      return UT.some(nodeChildren, function some ( nodeChild, index, array ) {
                         logWrite(DBG.TAG.DEBUG, "process child ", index, "with tag", nodeChild.nodeName, "of",
                                  currentNode.nodeName);

                         var result = count_word_and_char_till_node(nodeChild, startNode, aCharLengths, aWordLengths,
                                                                    tokenizer);
                         logWrite(DBG.TAG.DEBUG, "some returns ", result);
                         return result;
                      });
                   }
                }
                else {
                   // found startNode!!
                   logWrite(DBG.TAG.DEBUG, "found startNode");
                   return true;
                }
             }

             // we found startNode, now count words and characters till we reach the offset
             function count_word_and_char_till_offset ( startNode, /*OUT*/aCharLengths, /*OUT*/aWordLengths,
                                                        tokenizer ) {
                // tokenizer is passed here as a parameter because I need to use the same tokenizer that gave me the token array when highlighting previously
                if (startNode.nodeType !== startNode.TEXT_NODE) {
                   throw 'count_word_and_char_till_node: this is implemented only for text node! Passed ' +
                         startNode.nodeName + " " + startNode.nodeType;
                }

                var current_offset = 0,
                   aWords = tokenizer(startNode.textContent);
                aWords.some(function ( word, index, array ) {
                   logWrite(DBG.TAG.DEBUG, "processing", word);
                   aCharLengths.push(word.length);
                   // we put 1 because there is another word which has been parsed.
                   // Reminder : this array contains the number of words to be counted till reaching the final word
                   aWordLengths.push(word.trim() ? 1 : 0);
                   logWrite(DBG.TAG.DEBUG, "current_offset, startOffset", current_offset, startOffset);
                   current_offset +=
                   word.length + (word.length == 0 ? 1 : (array[index + 1] ? 1 : 0) );
                   return !(current_offset <= startOffset);
                });
             }

          };

          return TC;
       })
;
