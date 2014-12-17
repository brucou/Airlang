/**
 * Created by bcouriol on 17/09/14.
 */
define(['jquery',
        'rsvp',
        'socket',
        'ReaderModel',
        'TranslateController',
        'Stateful',
        'data_struct',
        'utils'],
       function ( $, RSVP, SOCK, RM, TC, STATE, DS, UT ) {
          //TEST CODE
          trace(RM, 'RM');
          //trace(TC, 'TC');
          //trace(DS, 'DS');
          ////////////
          var RC = {};
          RC.rtView = can.view('tpl-reader-tool-stub');

          /*
           Using a view adapter to have in the same place all variables which are bound in the view template
           This also allows for cleaner code in the controller...
           ...and the binding of the new controller instance when created...
           ...and not forgetting to use attr to modify those live bindings
           Another option would be to use this.options and pass the same data in an extra parameter when creating
           the controller. In my opinion, this.options distract from what is being done
           */
          RC.getViewAdapter = function get_view_adapter () {
             return new can.Map({
                                   url_to_load      : null,
                                   webpage_readable : null,
                                   error_message    : null,
                                   setErrorMessage  : function ( text ) {
                                      this.attr("error_message", text);
                                   },
                                   set_HTML_body    : function ( html_text ) {
                                      this.attr("webpage_readable", html_text)
                                   }
                                })
          };

          /**
           * Purpose : take a token and
           * @param  {string} word word to be highlighted
           * @param  {number} index index of word to be highlighted vs. the beginning of the document (starting
           *                  from the title)
           * @param {function} fn_filter filter function which highlight the word. Usually :: html_token -> html_token
           *                             where the output html_token is the original token surrounded by highlighting
           *                             html tags
           * @returns {function} Returns a function which takes a [html_token] structure and returns a token_action_map
           *                     structure with <i>fn_filter</i> as the action corresponding to the nth
           *                     <i>word</i> with n being <i>index</i>.
           *                     <i>word</i> input parameter is used as a check that we received the right index
           */
          RC.filter_selected_word = function filter_selected_word ( word, index, fn_filter ) {
             var filter_selected_word = function filter_selected_word ( aHTMLTokens ) {
                // reminder : tokenActionMap :: {token : html_token, action: function | null}
                var index_word = 0;

                // 1. split the text tokens into word tokens. Spaces will be translated to empty tokens ("")
                return UT.parseDOMtree_flatten_text_nodes(aHTMLTokens)
                   // 2. go over the words (non-empty string after removing spaces), and add the filter on the
                   //    word with the index passed as parameter
                   .map(function ( html_token ) {
                           switch (html_token.type) {
                              case 'html_begin_tag':
                              case 'html_end_tag':
                                 //
                                 return {token : html_token, action : null};
                                 break;

                              case 'text':
                                 var text_node_contents = html_token.text;
                                 if (!text_node_contents.trim()) {
                                    // we found some space(s)
                                    return {token : html_token, action : null};
                                 }
                                 else {
                                    return {
                                       token  : html_token,
                                       action : (index === index_word++)
                                          ? fn_filter
                                          : null
                                    }
                                 }
                                 break;

                              default :
                                 throw 'filter_selected_word: error, encountered an html_token with unknown type ' +
                                       html_token.type;
                                 break;
                           }
                        }
                );
             };
             filter_selected_word.input_type = 'array_of_html_token';
             filter_selected_word.output_type = 'token_action_map';
             filter_selected_word.filter_name = 'filter_selected_word';
             return filter_selected_word;
          };

          /**
           * Purpose    : return a note object containing the word and positional information about the word being clicked on
           * ASSUMPTION : function called from within a container such as returned by the parseDomTree function
           *              i.e. with numbered html tag except for text nodes
           * @param {jQuery} $el : jQuery element clicked on (target element)
           * @param {range} selectedRange range containing the click selection made by the user
           * @return {word: {String}, index: {Number}, rootNode: {Node}, context_sentence: {String}}
           */
          RC.getNoteFromWordClickedOn = function getNoteFromWordClickedOn ( $el, selectedRange ) {
             // count the number of words to the first element with ID

             // Two cases, the anchor object has an id property or it does not. Most of the time it won't
             var startNode = selectedRange.startContainer,
                 firstIDNode = RC.findParentWithId(startNode),
                 // Beware that the first character of textContent can be a space because of the way we construct the html of the page

                 parent_node_with_id = RC.findParentWithId(startNode),
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
             var word_index_to_selected_word = RC.getWordIndexFromIDParent($el, selectedRange);

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
          RC.findParentWithId = function findParentWithId ( startNode ) {
             // Find an ancestor node to startNode with an attribute id
             var currentNode = startNode;
             var ancestor_level = 0;
             while (currentNode &&
                    (currentNode.nodeType === currentNode.TEXT_NODE || !currentNode.getAttribute("id") )) {
                //logWrite(DBG.TAG.DEBUG, "no id found, looking higher up");
                currentNode = currentNode.parentNode;
                ancestor_level++;
             }
             if (currentNode === null) {
                // we reached the top of the tree and we found no node with an attribute ID...
                throw 'findParentWithId: could not find a node with an ID...'
             }

             //logWrite(DBG.TAG.DEBUG,                      "found id in parent " + ancestor_level + " level higher : " + currentNode.getAttribute("id"));
             return currentNode;
          };

          /**
           * Purpose    : return the word index from the first parent element with an existing attribute ID
           * ASSUMPTION : function called from within a container such as returned by the parseDomTree function
           *              i.e. with numbered html tag except for text nodes
           * @param {jQuery} $el : jQuery element clicked on (target element)
           * @param {range} selectedRange range containing the click selection made by the user
           * @returns {number} index of word (starting with 1) from parent with an existing attribute ID
           * TODO : treat the case where startNode is not a text node : as this is a click, it should always be the case
           *          unless we click on a tag (is that possible? on an image for instance? what if there is a selection before the click?
           */
          RC.getWordIndexFromIDParent = function getWordIndexFromIDParent ( $el, selectedRange ) {

             //var selectedRange = window.getSelection().getRangeAt(0);
             // if it is just a click, then anchor and focus point to the same location
             // but that means there is no selection having been done previously
             // For the moment we just deal with anchor

             // Two cases, the anchor object has an id property or it does not. Most of the time it won't
             var startNode = selectedRange.startContainer;
             var startOffset = selectedRange.startOffset;
             var textContent = startNode.textContent;
             // Beware that the first character of textContent can be a space because of the way we construct the html of the page

             //logWrite(DBG.TAG.DEBUG, "start node", startNode.nodeName, textContent, "offset", startOffset);

             // Init array variables tracing the counting
             var aCharLengths = [],
                 aWordLengths = [];

             // get the first parent with id
             var currentNode = RC.findParentWithId(startNode);

             // traverse tree till startNode and count words and characters while doing so
             count_word_and_char_till_node(currentNode, startNode, aCharLengths, aWordLengths, RM.simple_tokenizer);

             //logWrite(DBG.TAG.DEBUG, "found startNode", aCharLengths.reduce(UT.sum, 0), aWordLengths.reduce(UT.sum, 0));

             count_word_and_char_till_offset(startNode, aCharLengths, aWordLengths, RM.simple_tokenizer);

             //finished! Now count the number of words we have skipped to reach the final one and the chars
             selectedRange.detach();

             return aWordLengths.reduce(UT.sum, 0);

             ////// Helper functions
             function count_word_and_char_till_node ( currentNode, startNode, /*OUT*/aCharLengths, /*OUT*/aWordLengths, tokenizer ) {
                // tokenizer is passed here as a parameter because I need to use the same tokenizer that gave me the token array when highlighting previously
                if (!currentNode.isEqualNode(startNode)) {
                   // by construction, currentNode cannot be a TEXT_NODE the first time, as ancestor node have an ID
                   // and text node cannot have id
                   if (currentNode.nodeType === currentNode.TEXT_NODE) {
                      //logWrite(DBG.TAG.DEBUG, "process text node from", currentNode.nodeName);
                      var text_content = currentNode.textContent;
                      var text_content_trim = text_content.trim();
                      var aWords = tokenizer(text_content_trim);
                      aCharLengths.push(text_content.length);

                      if (text_content_trim) {
                         //logWrite(DBG.TAG.DEBUG, "non empty string: adding to word array");
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
                      //logWrite(DBG.TAG.DEBUG, "process children of node", currentNode.nodeName, "number of children",
                      //       currentNode.childNodes.length);
                      var nodeChildren = currentNode.childNodes;
                      return UT.some(nodeChildren, function some ( nodeChild, index, array ) {
                         //logWrite(DBG.TAG.DEBUG, "process child ", index, "with tag", nodeChild.nodeName, "of",
                         //       currentNode.nodeName);

                         var result = count_word_and_char_till_node(nodeChild, startNode, aCharLengths, aWordLengths,
                                                                    tokenizer);
                         return result;
                      });
                   }
                }
                else {
                   // found startNode!!
                   //logWrite(DBG.TAG.DEBUG, "found startNode");
                   return true;
                }
             }

             // we found startNode, now count words and characters till we reach the offset
             function count_word_and_char_till_offset ( startNode, /*OUT*/aCharLengths, /*OUT*/aWordLengths, tokenizer ) {
                // tokenizer is passed here as a parameter because I need to use the same tokenizer that gave me the token array when highlighting previously
                if (startNode.nodeType !== startNode.TEXT_NODE) {
                   throw 'count_word_and_char_till_node: this is implemented only for text node! Passed ' +
                         startNode.nodeName + " " + startNode.nodeType;
                }

                var current_offset = 0,
                    aWords = tokenizer(startNode.textContent);
                aWords.some(function ( word, index, array ) {
                   logWrite(DBG.TAG.DEBUG, "processing word", word);
                   aCharLengths.push(word.length);
                   // we put 1 because there is another word which has been parsed.
                   // Reminder : this array contains the number of words to be counted till reaching the final word
                   aWordLengths.push(word.trim() ? 1 : 0);
                   //logWrite(DBG.TAG.DEBUG, "current_offset, startOffset", current_offset, startOffset);
                   current_offset +=
                   word.length + (word.length == 0 ? 1 : (array[index + 1] ? 1 : 0) );
                   return !(current_offset <= startOffset);
                });
             }

          };

          RC.ReaderToolController = can.Control.extend(
             {
                defaults : {
                   view           : RC.rtView,
                   getViewAdapter : RC.getViewAdapter
                }
             },
             {
                init : function ( $el, options ) {//el already in jquery form
                   //TODO : user_id should not be in state here but got through a getter function from the shell
                   //defaults is loaded first in options
                   this.rtView = this.options.view;
                   this.viewAdapter = this.options.getViewAdapter();

                   // variable which will gather all the stateful properties
                   // setter, getter functions
                   this.stateMap = {
                      user_id           : this.options.user_id,
                      first_language    : this.options.first_language,
                      target_language   : this.options.target_language,
                      isUrlLoaded       : false,
                      tooltip_displayed : false,
                      note              : null,
                      range             : null,
                      lemma_target_lg   : null
                   };
                   $el.html(this.rtView(this.viewAdapter));

                   // initialize tooltip controller too
                   this.TC_init();
                },

                TC_init : function () {
                   return new TC.TranslateRTController("#airlang-rdt-tt-container",
                                                       {dismiss_on          : 'escape-key', target : this.element,
                                                          reader_controller : this});
                },

                last_mouse_stop : {x : 0, y : 0},
                timer25         : null,

                '#url_param change' : function combo_load_url ( $el, ev ) {
                   var viewAdapter = this.viewAdapter,
                       my_url = $el.val(),
                       self = this;
                   viewAdapter.attr("url_to_load", my_url);
                   viewAdapter.setErrorMessage(null);
                   viewAdapter.set_HTML_body(null);

                   RM.get_stored_notes(
                      { module   : 'reader tool',
                         user_id : 1, //TODO : temporary, the user_id should be obtained from some login
                         url     : my_url})
                      .then(
                      function get_stored_notes_success ( aNotes ) {
                         RM.make_article_readable(my_url)
                            .fail(function make_article_readable_error ( Error ) {
                                     logWrite(DBG.TAG.ERROR, "Error in make_article_readable", Error);
                                     viewAdapter.setErrorMessage(Error.toString());
                                     viewAdapter.set_HTML_body(null);
                                  })
                            .done(function make_article_readable_success ( html_text ) {
                                     logWrite(DBG.TAG.INFO, "URL read successfully");
                                     viewAdapter.set_HTML_body(html_text);
                                     viewAdapter.setErrorMessage("");
                                     self.stateSetIsUrlLoaded(true);
                                  });
                      },
                      function get_stored_notes_failure () {
                         logWrite(DBG.TAG.ERROR, 'RM.get_stored_notes', err);
                      }
                   );
                },

                '{window} al-ev-tooltip_dismiss' : function tooltip_dismiss_handler ( $el, ev ) {
                   logWrite(DBG.TAG.EVENT, "al-ev-tooltip_dismiss", "received");
                   // Update state
                   this.stateMap.tooltip_displayed = false;
                   // Check parameters : we need min. a word, lemma and translation
                   if (!ev.translation_word || !this.stateMap.note.word || !ev.lemma_target_lg) {
                      logWrite(DBG.TAG.WARNING, "tooltip_dismiss_handler", "word or lemma or translation are falsy");
                      return false
                   }
                   // Add the note in the note table and visually display the annotated word
                   // TODO this.stateMap.note.word = ev.lemma_target_lg; keep word in note pad, lemma in noteweight
                   // add column lemma is both table, that's the simplest
                   this.stateMap.lemma_target_lg = ev.lemma_target_lg;
                   console.log("stateMap show and add note", this.stateMap);
                   this.show_and_add_note(this.element, this.stateMap);
                   // TODO : fill the translation table and use lemma word instead of current word form
                   SOCK.RSVP_emit('set_word_user_translation', {
                      user_id                   : this.stateMap.user_id,
                      word                      : this.stateMap.note.word, // word selected by click
                      translation_word          : ev.translation_word,
                      lemma_target_lg           : ev.lemma_target_lg,
                      sample_sentence_first_lg  : ev.sample_sentence_first_lg,
                      sample_sentence_target_lg : ev.sample_sentence_target_lg,
                      first_language            : this.stateMap.first_language,
                      target_language           : this.stateMap.target_language
                   });
                   return false;
                },

                '{window} al-ev-shown_tooltip' : function ( $el, ev ) {
                   logWrite(DBG.TAG.EVENT, "al-ev-shown_tooltip", "received");
                   this.stateMap.tooltip_displayed = true;
                },

                'click' : function click ( $el, ev ) {
                   logWrite(DBG.TAG.EVENT, "RC click", "received", "target", ev.target.tagName);
                   logWrite(DBG.TAG.DEBUG, "tooltip displayed", this.stateMap.tooltip_displayed);

                   // if the click is on the dropdown select then ignore
                   if (ev.target.nodeName === 'SELECT') {return true}
                   // if already displaying the tooltip, ignore clicks out of the tooltip or bubbled up
                   if (this.stateMap.tooltip_displayed) {return false}
                   // else process according to configuration passed in options
                   ev.stopPropagation();
                   // Get all data necessary for adding the note if need be
                   // necessary to do it now, because it is based on the click selection which will change
                   // when displaying the tooltip
                   logWrite(DBG.TAG.EVENT, "al-ev-show_tooltip", "emitting");
                   var range = window.getSelection().getRangeAt(0);
                   UT._extend(this.stateMap, {
                      $rdt_el : $el, range : range,
                      note    : RC.getNoteFromWordClickedOn($el, range)});
                   this.element.trigger(UT.create_jquery_event(
                      'al-ev-show_tooltip',
                      {clientX : ev.clientX, clientY : ev.clientY}));
                   //TODO : don't assume success of operation
                   // get an event tooltip_shownto update the flag
                   // that event will be emitted only when all parameters of tooltip are valid
                   //this.stateMap.tooltip_displayed = true;
                   return false; // don't bubble the click, we dealt with it here
                },

                add_note : function ( stateMap, viewAdapter, note ) {
                   return RSVP.all([
                                      RM.add_notes({module             : 'reader tool',
                                                      url              : viewAdapter.url_to_load,
                                                      user_id          : stateMap.user_id,
                                                      word             : note.word,
                                                      lemma            : stateMap.lemma_target_lg,
                                                      context_sentence : note.context_sentence,
                                                      index            : note.index}),
                                      RM.add_TSR_weight({user_id : stateMap.user_id,
                                                           // put the lemma in the list of words to TSR revise, not the declensed word
                                                           word  : stateMap.lemma_target_lg})
                                   ])
                      .then(function success_add_note ( param1, param2 ) {
                               // TODO: check success of addition through return values of promises
                               // here we return null if the (user_id, word) was already in TSR_weight
                               //generally speaking we need a system to give feedback,
                               // could be just a code whose semantics is defined at server level
                               // this will be used for cases where no ERROR is to be raised but it is relevant to give
                               // more info as per what went wrong
                               logWrite(DBG.TAG.DEBUG, "added note remotely!")
                            },
                            function failure_add_note ( err ) {
                               logWrite(DBG.TAG.ERROR, "failure remotely adding note", UT.inspect(err));
                            });
                },

                '{document} mousestop' : function ( $el, ev ) {
                   if (this.options.translate_by != 'point') {
                      return true;
                   }
                   this.element.trigger('show_tooltip');
                   //this.process(ev, this.$tooltip, this.options);
                },

                'mousemove' : function ( $el, ev ) {
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

                hasMouseReallyMoved : function ( e ) { //or is it a tremor?
                   var left_boundry = parseInt(this.last_mouse_stop.x) - 5,
                       right_boundry = parseInt(this.last_mouse_stop.x) + 5,
                       top_boundry = parseInt(this.last_mouse_stop.y) - 5,
                       bottom_boundry = parseInt(this.last_mouse_stop.y) + 5;
                   return e.clientX > right_boundry || e.clientX < left_boundry || e.clientY > bottom_boundry ||
                          e.clientY < top_boundry;
                },

                show_and_add_note : function show_and_add_note ( $el, stateMap ) {
                   //TODO : pass a stateMap object in show_Add_note and add_note
                   // adjust the testing related to add note and show_adn_add_note
                   // THEN add the lemma_target_lg field in the pg_notepad table
                   // THEN recheck the logic or notepad vs. weight : do I need also to add the word/lemma field there -> should not
                   if (!stateMap.isUrlLoaded) {
                      //that flag is set after a successful load of an url
                      return;
                   }
                   //this is a stub for testing
                   var range = stateMap.range || window.getSelection().getRangeAt(0);
                   // this is to eliminate possible side effects when calling from another window like tooltip for instance
                   var note = stateMap.note || RC.getNoteFromWordClickedOn($el, range);
                   stateMap.note = note; // necessary to initialize it if not yet

                   var self = this;
                   note.word = UT.remove_punct(note.word);
                   // modify the filter selected words to include the closure on the note
                   var modified_filter_selected_words = function ( aHTMLtoken ) {
                      return RM.filter_selected_words(aHTMLtoken, [note])
                   };
                   modified_filter_selected_words.input_type = RM.filter_selected_words.input_type;
                   modified_filter_selected_words.output_type = RM.filter_selected_words.output_type;

                   return RSVP.all(
                      [
                         RM.apply_highlighting_filters_to_text(
                            $(note.rootNode), RM.fn_parser_and_transform([], [], true),
                            [modified_filter_selected_words]
                         ),
                         self.add_note(stateMap, self.viewAdapter, note)
                      ]).then(function update_html_text ( aPromiseResults ) {
                                 // update the html in reader controller
                                 var highlighted_text = aPromiseResults[0];
                                 self.viewAdapter.setErrorMessage(null);
                                 self.viewAdapter.set_HTML_body(highlighted_text);
                                 return highlighted_text;
                              });
                },

                stateSetIsUrlLoaded : function stateSetIsUrlLoaded ( is_loaded ) {
                   this.stateMap.isUrlLoaded = is_loaded;
                },

                stateGetIsUrlLoaded : function stateGetIsUrlLoaded () {
                   return this.stateMap.isUrlLoaded;
                }

             });

          return RC;
       })
;
