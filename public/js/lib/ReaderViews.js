/**
 * Created by bcouriol on 28/08/14.
 * Big update on 24.6.15
 */
define(['debug', 'component', 'rx', 'utils'], function ( DBG, Component, Rx, UT ) {
  var RV;
  var tpl = [];
  tpl.push("<table id='table_tooltip' data-content='translation_table'>");
  tpl.push("<thead>");
  tpl.push("<tr>");
  tpl.push("<th colspan='3'>{{translation_lemma}}</th>");
  tpl.push("</tr>");
  tpl.push("</thead>");
  tpl.push("<tbody>");

  tpl.push("{{#result_rows}}");
  tpl.push("<tr class='al-rdt-tt-row-translation' data-content='translation' data-lemma='{{lemma}}'>");
  tpl.push("<td class='al-rdt-tt-col-tsense'> {{translation_sense}} </td>");
  tpl.push("<td class='al-rdt-tt-col-lemma'> {{lemma}} </td>");
  tpl.push("<td class='al-rdt-tt-col-sense'> {{{sense}}} </td>");
  tpl.push("</tr>");
  tpl.push("<tr class='al-rdt-tt-row-example' data-content='sample_sentences'>");
  tpl.push("<td colspan='3' class='al-rdt-tt-sample_sentence_from' " +
           "data-content-sentence-first-lg='{{example_sentence_from}}' " +
           "data-content-sentence-target-lg='{{example_sentence_to}}'>");
  tpl.push(" {{example_sentence_from}}{{{example_sentence_from_sep}}}" +
           "<strong>{{{example_sentence_to}}}</strong>");
  tpl.push("</td>");
  tpl.push("</tr>");
  tpl.push("{{/result_rows}}");

  tpl.push("</tbody>");
  tpl.push("</table>");
  var translation_template = tpl.join("\n");

  var ReaderToolComponent = Component.extend(
    {
      template           : [
        '<div id = "reader_tool">',
        '<select id="url_param">',
        '  <option value=""></option>',
        '  <option value="http://www.courrierinternational.com/article/2014/06/20/ukraine-un-plan-de-paix-lourd-de-menaces">',
        '    courrier international',
        '  </option>',
        '  <option value="http://sip.denik.cz/sex-a-vztahy/sokujici-zjisteni-cesi-jsou-v-sexu-suverenne-nejlepsi-na-svete-20140706.html">',
        '    denik 2',
        '  </option>',
        '  <option value="http://www.w3schools.com/html/html_tables.asp">w3schools table</option>',
        '  <option value="http://perishablepress.com/perfect-pre-tags/">code pre</option>',
        '  <option value="http://www.wordreference.com/czen/p%C5%99ijmout">dict czech</option>',
        '  <option value="http://ekonomika.idnes.cz/koruna-je-nejslabsi-od-brezna-2009-k-dolaru-je-na-dvouletem-minimu-pvb-/ekonomika.aspx?c=A140805_171821_ekonomika_spi">finance idnes',
        '  </option>',
        '  <option value="http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572">',
        '    cesky noviny',
        '  </option>',
        '  <option value="http://zpravy.idnes.cz/britsky-premier-cameron-vyzyva-k-lepsi-obrane-nato-fxf-/zpr_nato.aspx?c=A140805_170157_zpr_nato_inc#utm_source=sph.idnes&utm_medium=richtext&utm_content=top6">britain idnes</option>',
        '  <option value="http://www.praha3.cz/noviny/akce-mestske-casti/vinohradske-vinobrani-nabidne-produkty.html">Wine',
        '  </option>',
        '  <option value="http://ona.idnes.cz/jak-prestat-kourit-a-nepribrat-dza-/zdravi.aspx?c=A140912_114509_zdravi_pet">Ona',
        '  </option>',
        '  ',
        '  <option value="http://ekonomika.idnes.cz/odbory-air-france-ukoncily-po-tydnech-stavku-neni-vhodna-doba-tvrdi-1pz-/eko-doprava.aspx?c=A140928_133029_eko-doprava_hro">',
        '  Air France',
        '  </option>',
        '</select>',
        '<span id="url">{{url_to_load}}</span>',
        '<div id="error_message"> {{{ error_message }}} </div>',
        '<div id="content">{{{ webpage_readable }}}</div>',
        '</div>'
      ].join(" "),
      template_selectors : {
        reader_tool : "reader_tool",
        url_choice  : "url_param",
        url_show    : "url",
        error       : "error_message",
        content     : "content"
      },
      data               : {url_to_load : null, webpage_readable : null, error_message : null},
      actions            : {
        // Define events (NOW ACTIONS because of name conflict with ractive library)
        // MUST return an Rx.Observable object, as the handlers are expecting it

        //events are called in the context of the main object
        'Rx_select_url'    : function ( view ) {
          console.log("Rx_select_url : creating observable");
          return Rx.Observable.fromEvent(document.getElementById(view.template_selectors.url_choice), 'change')
            .map(function ( ev ) {
                   console.log("URL selected", ev.target.value);
                   return ev.target.value;
                 })
        },

        // NOTE : This makes only sense for selecting on click or point, but not on selecion as:
        // selection can has several words, which makes index property not applicable
        // Here we do only click, because mouseover would require a different observable making
        'Rx_selected_word' : function ( view ) {
          console.log("Rx_selected_word : creating observable");
          return Rx.Observable.fromEvent(document.getElementById(view.template_selectors.content), 'click')
            .filter(function ( ev ) {
                      console.log("is_tooltip_displayed : ", view.state.is_tooltip_displayed);
                      var hit_elem = document.elementFromPoint(ev.clientX, ev.clientY);

                      return !view.state.is_tooltip_displayed // tooltip displayed in modal mode
                               && ev.target.nodeName !== 'SELECT' // ignore clicks on the drop-down
                               && !/INPUT|TEXTAREA/.test(hit_elem.nodeName) //don't mess around with html inputs
                        && !((hit_elem.getAttribute('contenteditable') ==
                              'true' || //and editable divs
                              $(hit_elem).parents('[contenteditable=true]').length >
                              0));
                    })
            .map(function ( e ) {
                   // TODO : do soemthing a la getNoteFromWordClickedOn
                   // to get all those parameters before displaying the tooltip
                   var selection = window.getSelection();
                   var selectedRange = selection.getRangeAt(0);
                   var note = view.helpers.getNoteFromWordClickedOn(view, selectedRange);
                   console.log("Rx_selected_word: note", note);
                   return {
                     e            : e,
                     //                        word: view.helpers.getWordFromSelection(e, document, window.getSelection(), view.props.translate_by,                            view.helpers.getHitWord),
                     word         : UT.remove_punct(note.word),
                     index        : note.index,
                     root_node_id : '0'
                   }
                 })
            .filter(function non_empty ( obj ) {
                      console.log("word clicked on : ", obj.word);
                      return obj.word;
                    })
        }
      },
      handlers           : {
        'Rx_select_url' : function H_display_url ( view, url ) {
          console.log("handling url : ", url);
          // Update the route with the new state
          view.go([
                    {
                      action : 'showUrl',
                      state  : { url : url, webpage_readable : "", is_tooltip_displayed : false}
                    }
                  ]);
        },

        'Rx_selected_word' : function H_show_translation ( view, obj ) {
          // In principle we get here after having made sure that the tooltip is not displayed
          console.log("handling word : ", obj.word);
          console.log("note index : ", obj.index);

          var word = obj.word;
          var ev = {clientX : obj.e.clientX, clientY : obj.e.clientY};

          // Add the note to the current view state
          // NOTE : This is not semantically a view state as it is not translated into any visible property
          view.state.note = obj;
          view.go([
                    { action : 'showUrl', state : view.state},
                    { action : 'showUrl.tooltip', state : {
                      word : word, ev : ev
                    } }
                  ]);
        }
      },
      listeners          : {
        'TranslationTooltip' : {
          'info'   : function tt_listener ( view, message, channel ) {
            switch (message.content) {
              case view.props.TOOLTIP_SHOWN:
                view.state.is_tooltip_displayed = true;
                break;
              case view.props.TOOLTIP_HIDDEN :
                view.state.is_tooltip_displayed = false;
                break;
              default:
                break;
            }
          },
          'submit' : function tt_listener ( view, message, channel ) {
            var chosen_translation = message;
            // change the model locally
            // TODO ideally like this
            // Update model.notes
            //    view.model.notes.add(chosen_translation);
            // Change the route
            // There is then NO routing problem :
            // then the url is displayed webpage_readable is recalculated as f(model, g(url))
            // and that g(url) is cached so cost nothing to recall
            // BUT I compute everytime f(model, g(url)
            // which is less efficient that just displaying the delta f(model.t+1,..) = small_op(f(model.t, ..))

            // I should have this in state
            /*state: {
             word: word, ev: ev,
             index : obj.index,
             root_node_id: obj.root_node_id
             } */
            view.helpers.show_note(view);
          }
        }
      },
      props              : {
        // inmutable properties, for instance passed as option parameters
        translate_by            : 'click',
        MAX_TRANSLATION_ROWS    : 9,
        EXAMPLE_SENTENCE_TO_SEP : '|',
        PREFIX_CHAR             : "%",
        TRANS_GROUP_SIZE        : "3",
        SENSE_SEP               : "<br/>",
        // copied from tooltip. But now how is that different from duplicating it..
        TYPE_SUBMIT             : 'submit',
        TYPE_INFO               : 'info',
        TOOLTIP_SHOWN           : 'shown',
        TOOLTIP_HIDDEN          : 'hidden'
      },
      state_default      : {
        // mutable properties
        url                  : undefined,
        is_tooltip_displayed : false
      },
      helpers            : {
        // should be pure functions as much as possible to allow for separate testing
        // only allowed dependencies is with this.props (inmutable properties)
        getWordFromSelection : function ( e, document, selection, translate_by, fn_getHitWord ) {
          var word = '',
            hit_elem = document.elementFromPoint(e.clientX, e.clientY),
            sel_container = selection.getRangeAt(0).commonAncestorContainer;

          if (selection.toString()) {
            while (sel_container.nodeType !== Node.ELEMENT_NODE) {
              sel_container = sel_container.parentNode;
            }

            if (// only choose selection if mouse stopped within immediate parent of selection
              ( $(hit_elem).is(sel_container) ||
                $.contains(sel_container, hit_elem) )
              // and since it can still be quite a large area
              // narrow it down by only choosing selection if mouse points at the element that is (partially) inside selection
              && selection.containsNode(hit_elem, true)
            // But what is the point for the first part of condition? Well, without it, pointing at body for instance would also satisfy the second part
            // resulting in selection translation showing up in random places
              ) {
              word = selection.toString();
            }
            else if (translate_by == 'point') {
              word = fn_getHitWord(e);
            }
          }
          else {
            word = fn_getHitWord(e);
          }
          return word;
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
            return this.nodeType == Node.TEXT_NODE &&
                   XRegExp(word_re).test(this.nodeValue)
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
              logWrite(DBG.TAG.DEBUG, "getHitText: '" +
                                      node.textContent + "'");

              if (XRegExp(word_re).test(node.textContent)) {
                $(node).replaceWith(function () {
                  return this.textContent.replace(XRegExp("^(.{" +
                                                          Math.round(node.textContent.length /
                                                                     2) +
                                                          "}\\p{L}*)(.*)", 's'), function ( $0, $1, $2 ) {
                    return '<transblock>' + UT.escape_html($1) +
                           '</transblock><transblock>' +
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

        show_note : function show_note ( view ) {
          var helpers = view.helpers;
          var model = view.module.model;
          var note = view.state.note;

          // Edge case, we do not have a valid note object in the state object
          // That should never happen but we have it here as a guard
          if (!(note.word && note.index && note.root_note_id)) {
            view.set({error_message : "Trying to execute show_note but no note object found!"});
          }

          log.debug("show_note : note", note);
          // modify the filter selected words to include the closure on the note
          var modified_filter_selected_words = function ( aHTMLtoken ) {
            return model.filter_selected_words(aHTMLtoken, [note])
          };
          modified_filter_selected_words.input_type =
          RM.filter_selected_words.input_type;
          modified_filter_selected_words.output_type =
          RM.filter_selected_words.output_type;
          modified_filter_selected_words.filter_name =
          RM.filter_selected_words.filter_name;

          return RSVP.all(
            [
              model.apply_highlighting_filters_to_text(
                $(view._helpers.jQueryfyID(note.root_node_id)), model.fn_parser_and_transform([], [], true),
                [modified_filter_selected_words]
              ),

              model.notes.add_note(view.state, view, note)
            ]).then(function update_html_text ( aPromiseResults ) {
                      // update the html in reader controller
                      var highlighted_text = aPromiseResults[0];
                      view.set({error_message : "", webpage_readable : highlighted_text});
                      return highlighted_text;
                    });
        },

        /**
         * Purpose    : return a note object containing the word and positional information about the word being clicked on
         * ASSUMPTION : function called from within a container such as returned by the parseDomTree function
         *              i.e. with numbered html tag except for text nodes
         * @param {jQuery} $el : jQuery element clicked on (target element)
         * @param {range} selectedRange range containing the click selection made by the user
         * @return {word: {String}, index: {Number}, rootNode: {Node}, context_sentence: {String}}
         */
        getNoteFromWordClickedOn : function getNoteFromWordClickedOn ( view, selectedRange ) {
          log.debug("getNoteFromWordClickedOn : view", view)
          var helpers = view.helpers;
          var model = view.module.model;
          // count the number of words to the first element with ID

          // Two cases, the anchor object has an id property or it does not. Most of the time it won't
          var startNode = selectedRange.startContainer,
            firstIDNode = helpers.findParentWithId(startNode),
          // Beware that the first character of textContent can be a space because of the way we construct the html of the page

            parent_node_with_id = helpers.findParentWithId(startNode),
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
                     ?
                          RM.simple_tokenizer(node.textContent).map(UT.count_word).reduce(UT.sum, 0)
                     // not a text node so no words to count here
                     :
                          0;
                 })
            // the sum all those numbers
            .reduce(UT.sum, 0);

          // now calculate the number of words from selected node to selected word
          var word_index_to_selected_word = helpers.getWordIndexFromIDParent(
            view,
            view._helpers.jQueryfyID(view.template_selectors.reader_tool),
            selectedRange
          );

          // get selected word from the index
          var full_text = rootNode.textContent;
          if (!full_text) {
            // that should never happen right?
            // we let it slip and let the caller decide what to do
            return {word : null, index : null, context_sentence : null, rootNode : null}
          }
          var final_index = word_index_to_selected_node +
                            word_index_to_selected_word;

          return model.get_note_from_param(full_text, final_index, rootNode);
        },

        /**
         *
         * @param startNode {Node}
         * @returns {Node}
         * @throws {Exception} throws 'findParentWithId: could not find a node with an ID...'
         */
        findParentWithId : function findParentWithId ( startNode ) {
          // Find an ancestor node to startNode with an attribute id
          var currentNode = startNode;
          var ancestor_level = 0;
          while (currentNode &&
                 (currentNode.nodeType === currentNode.TEXT_NODE || !currentNode.getAttribute("id") )) {
            //log.debug( "no id found, looking higher up");
            currentNode = currentNode.parentNode;
            ancestor_level++;
          }
          if (currentNode === null) {
            // we reached the top of the tree and we found no node with an attribute ID...
            throw 'findParentWithId: could not find a node with an ID...'
          }

          //log.debug( "found id in parent " + ancestor_level + " level higher : " + currentNode.getAttribute("id"));
          return currentNode;
        },

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
        getWordIndexFromIDParent : function getWordIndexFromIDParent ( view, $el, selectedRange ) {
          var helpers = view.helpers;
          var model = view.module.model;
          console.log("model", model)
          //var selectedRange = window.getSelection().getRangeAt(0);
          // if it is just a click, then anchor and focus point to the same location
          // but that means there is no selection having been done previously
          // For the moment we just deal with anchor

          // Two cases, the anchor object has an id property or it does not. Most of the time it won't
          var startNode = selectedRange.startContainer;
          /*TEST CODE*/
          stN = startNode; ////////
          var startOffset = selectedRange.startOffset;
          var textContent = startNode.textContent;
          // Beware that the first character of textContent can be a space because of the way we construct the html of the page

          log.debug("start node", startNode.nodeName, textContent, "offset", startOffset);

          // Init array variables tracing the counting
          var aCharLengths = [],
            aWordLengths = [];

          // get the first parent with id
          var currentNode = helpers.findParentWithId(startNode);
          /*TEST CODE*/
          currN = currentNode; ////////
          log.debug("current node", currentNode.nodeName, currentNode.textContent);

          // traverse tree till startNode and count words and characters while doing so
          // TODO: case currentNode = startNode not handled
          count_word_and_char_till_node(currentNode, startNode, aCharLengths, aWordLengths, model.simple_tokenizer);

          //log.debug( "found startNode", aCharLengths.reduce(UT.sum, 0), aWordLengths.reduce(UT.sum, 0));

          count_word_and_char_till_offset(startNode, aCharLengths, aWordLengths, model.simple_tokenizer);

          //finished! Now count the number of words we have skipped to reach the final one and the chars
          selectedRange.detach();

          return aWordLengths.reduce(UT.sum, 0);

          ////// Helper functions
          function count_word_and_char_till_node ( currentNode, startNode, /*OUT*/aCharLengths, /*OUT*/aWordLengths, tokenizer ) {
            // tokenizer is passed here as a parameter because I need to use the same tokenizer that gave me the token array when highlighting previously
            if (!currentNode.isEqualNode(startNode)) {
              // by construction, currentNode cannot be a TEXT_NODE the first time, as ancestor node have an ID
              // and text node cannot have id
              if (currentNode.nodeType === currentNode.TEXT_NODE ||
                  currentNode.nodeName === "BR") {
                //log.debug( "process text node from", currentNode.nodeName);
                var text_content = currentNode.textContent;
                var text_content_trim = text_content.trim();
                var aWords = tokenizer(text_content_trim);
                aCharLengths.push(text_content.length);

                if (text_content_trim) {
                  //log.debug( "non empty string: adding to word array");
                  // if text_content is only spaces, there is no words to count!!
                  aWordLengths.push(aWords.length);
                }
                return false;
              }
              else {//TODO : SAUF BR which is not text node, and yet do not have child nodes
                // otherwise we have an element node, which do not have a text, just proceed to the next child
                if (!currentNode.hasChildNodes()) {
                  throw "count_word_and_char_till_node: children nodes not found and we haven't reached the startNode!! Check the DOM, this is impossible";
                }
                //log.debug( "process children of node", currentNode.nodeName, "number of children",
                //       currentNode.childNodes.length);
                var nodeChildren = currentNode.childNodes;
                return UT.some(nodeChildren, function some ( nodeChild, index, array ) {
                  //log.debug( "process child ", index, "with tag", nodeChild.nodeName, "of",
                  //       currentNode.nodeName);

                  var result = count_word_and_char_till_node(nodeChild, startNode, aCharLengths, aWordLengths,
                                                             tokenizer);
                  return result;
                });
              }
            }
            else {
              // found startNode!!
              //log.debug( "found startNode");
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
              log.debug("processing word", word);
              aCharLengths.push(word.length);
              // we put 1 because there is another word which has been parsed.
              // Reminder : this array contains the number of words to be counted till reaching the final word
              aWordLengths.push(word.trim() ? 1 : 0);
              //log.debug( "current_offset, startOffset", current_offset, startOffset);
              current_offset +=
              word.length +
              (word.length == 0 ? 1 : (array[index + 1] ? 1 : 0) );
              return !(current_offset <= startOffset);
            });
          }

        }

      },
      error_handler      : function ( view, error ) {
        // error is an instance of the generic type Error in javascript
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
        // TODO : add processing of other type of error - this is for "cannot load url"
        view.set({error_message : error.message + error.stack});
        view.set({webpage_readable : ""});
        throw error;
      },
      module             : 'rdt',
      name               : 'ReaderToolComponent'
    });

  var Component_Tooltip = Component.extend(
    {
      template : "" +
                 "<div id='airlang-rdt-tt' class='airlang-rdt-tt-transover' style='display: {{display}}; top: {{top}}; left: {{left}}; width:{{width}}; height:{{height}}; text-align: {{text_align}}; position:fixed;  white-space:nowrap;'> " +
                 "{{yield}}" +
                 "</div> ",
      name     : 'Component_Tooltip'
    });

  var Component_TT_Translation = Component.extend(
    {
      template : translation_template,
      name     : 'Component_TT_Translation'
    });

  var Component_TT_Input = Component.extend(
    {
      template : "<div class='airlang-rdt-tt-input'> " +
                 "        <label>Write translation: " +
                 "            <input id='al-rdt-tt-input' type='text' placeholder='Enter text here' value='{{chosen_translation}}' autofocus> " +
                 "        </label> " +
                 "</div>",
      append   : true,
      data     : {/*chosen_translation: ""*/},
      name     : 'Component_TT_Input'
    });

  var TranslationTooltip = Component.extend(
    {
      el                 : 'airlang-rdt-tt-container',
      append             : true,
      template           : "<al-tooltip>\n" +
                           "    <al-tt-translation display='{{display_translation}}' translation_lemma='{{translation_lemma}}' result_rows='{{result_rows}}'/> " +
                           "    <al-tt-input chosen_translation = '{{chosen_translation}}'/> " +
                           "</al-tooltip>",
      template_selectors : {
        table_tooltip : "table_tooltip",
        input_field   : "al-rdt-tt-input"
      },
      components         : {
        'al-tooltip'        : Component_Tooltip,
        'al-tt-translation' : Component_TT_Translation,
        'al-tt-input'       : Component_TT_Input
      },
      actions            : {
        'Rx_select_translation' : function ( view ) {
          return Rx.Observable.fromEvent(document.getElementById(view.template_selectors.table_tooltip), 'click')
            .map(function ( ev ) {
                   return view.helpers.view.get_translation_clicked_on(ev);
                 });
        },
        'Rx_submit_translation' : function ( view ) {
          return Rx.Observable.fromEvent(document.getElementById(view.template_selectors.input_field), 'keypress')
            .filter(function ( ev ) {
                      return ev.keyCode == 13;
                    })
            .map(function ( _ ) {
                   return view.get('chosen_translation');
                 })
        }
      },
      handlers           : {
        'Rx_select_translation' : function ( view, objTrans ) {
          view.set({chosen_translation : objTrans.translation_word});
          view.state.objTrans = objTrans;
        },
        'Rx_submit_translation' : function ( view, chosen_translation ) {
          console.log("submit_translation", chosen_translation);
          view._channel.emit(view.props.TYPE_SUBMIT, chosen_translation);
        }
      },
      channel            : 'TranslationTooltip',
      props              : {
        TYPE_SUBMIT    : 'submit',
        TYPE_INFO      : 'info',
        // Dependencies with tooltip.props
        TOOLTIP_SHOWN  : 'shown',
        TOOLTIP_HIDDEN : 'hidden'
      },
      helpers            : {
        view : {
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
                sample_sentence_first_lg =
                $tr_next_1st_child.data('content-sentence-first-lg').trim();
                sample_sentence_target_lg =
                $tr_next_1st_child.data('content-sentence-target-lg').trim();
                lemma_target_lg =
                $tr.closest('table').find('th').html().trim()
                break;
              case 'sample_sentences': // Case 4
                translation_word = $tr.prev().data('lemma').trim();
                $tr_1st_child = $tr.children(0);
                sample_sentence_first_lg =
                $tr_1st_child.data('content-sentence-first-lg').trim();
                sample_sentence_target_lg =
                $tr_1st_child.data('content-sentence-target-lg').trim();
                lemma_target_lg =
                $tr.closest('table').find('th').html().trim();
                break;
              default: // Case 1 and 2 and whatever
                translation_word = this.get('chosen_translation');
                lemma_target_lg =
                this._helpers.jQueryfyID(this.template_selectors.table_tooltip)
                  .find('th').html().trim();
                break;
            }
            return {
              translation_word          : translation_word,
              sample_sentence_first_lg  : sample_sentence_first_lg,
              sample_sentence_target_lg : sample_sentence_target_lg,
              lemma_target_lg           : lemma_target_lg
            }
          },
          getTableWidth              : function () {
            return this._helpers.jQueryfyID(this.template_selectors.table_tooltip).width();
          },
          getTableHeight             : function () {
            return this._helpers.jQueryfyID(this.template_selectors.table_tooltip).height();
          },
          getTranslationTable        : function () {
            return this._helpers.jQueryfyID(this.template_selectors.table_tooltip);
          }
        },

        /**
         * This function is called with a node callback signature (err, data)
         * @param err
         * @param aValues
         * @returns {null}
         */
        showTranslation : function showTranslation ( word, ev, aValues ) {
          if (aValues.length === 0) { // means server returned empty
            logWrite(DBG.TAG.WARNING, "Query did not return any values");
            // dismiss the tooltip (invisible but still capting events away from other controllers
            return null;
          }

          logWrite(DBG.TAG.INFO, "Translation fetched");

          // Get table html text which contains the translation of the word
          var objFormattedTranslationResults = this.helpers.formatTranslationResults(aValues);

          // Then when the translation is chosen, emit the corresponding action
          // with two listeners : one for model changes (RPC server-side)
          //                      one for updating ReaderComponent state (and corresponding visual display)
          // When window is closed, send a NOTIFICATION, window dismiss
          // That means IMPLEMENT THE ACTION MECHANISM (pass a subject handler?)
          // Also, check the dispose removing all handlers and references to created objects (dispose tooltip end)

          var $tbl = this.helpers.view.getTranslationTable();
          var width = this.helpers.view.getTableWidth();
          var height = this.helpers.view.getTableHeight();
          var pos = this.helpers.compute_position(ev.clientX, ev.clientY, $tbl);

          return {
            // Translation parameters
            display_translation : 'block',
            translation_lemma   : objFormattedTranslationResults.translation_lemma,
            result_rows         : objFormattedTranslationResults.result_rows,
            // Input box parameters
            chosen_translation  : "",
            //tooltip parameters
            display             : 'block',
            left                : [pos.x, 'px'].join(""),
            top                 : [pos.y, 'px'].join(""),
            width               : [width, 'px'].join(""),
            height              : [height, 'px'].join("")
          };
        },

        formatTranslationResults : function formatTranslationResults ( aValues ) {
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

          console.log(aValues);
          // Isolating external dependencies
          var MAX_TRANSLATION_ROWS = this.props.MAX_TRANSLATION_ROWS;
          var EXAMPLE_SENTENCE_TO_SEP = this.props.EXAMPLE_SENTENCE_TO_SEP;

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
            row_value.example_sentence_from =
            str_empty_if_null(row_value.example_sentence_from);
            row_value.example_sentence_from_sep =
            row_value.example_sentence_from ? '<br/>' : '';
          });
          var aValuesReduced = this.helpers.reduce_lemma_translations(aValues);
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

          return {result_rows : aValuesTruncated, translation_lemma : aValuesTruncated[0].translation_lemma};
        },

        reduce_lemma_translations : function reduce_lemma_translations ( aValues ) {
          // aggregate different translations into groups of TRANS_GROUP_SIZE, separated by SENSE_SEP
          // Isolating external dependencies
          var PREFIX_CHAR = this.props.PREFIX_CHAR,
            TRANS_GROUP_SIZE = this.props.TRANS_GROUP_SIZE,
            SENSE_SEP = this.props.SENSE_SEP;

          var mapTranslations = {};

          function add_if_not_empty ( source, add_str ) {
            return source ? (source + add_str) : '';
          }

          //check input parameters
          if (!aValues) {
            logWrite(DBG.TAG.ERROR, "reduce_lemma_translations : passed a null object aValues - ignoring");
            return null;
          }

          // create a double map
          aValues.forEach(function ( rowValue ) {
            mapTranslations[rowValue.lemma] =
            mapTranslations[rowValue.lemma] || {};
            var currLemma = mapTranslations[rowValue.lemma];
            rowValue.sense = rowValue.sense || ""; // to avoid null values
            var sense_prefix = (rowValue.example_sentence_from &&
                                rowValue.example_sentence_from.trim() )
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
            aSenses.forEach(function ( sense ) {
              sense.rowValue = mapTranslations[lemma][sense];
            });

            if (aSenses.length === 0) { // cannot be empty by construction
              throw "reduce_lemma_translations : no sense for lemma " +
                    lemma;
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
              if (mapTranslations[lemma][sense].sense.charAt(0) ===
                  PREFIX_CHAR) {
                return;
              }
              // case with several senses for same lemma and no example sentences
              // Group them
              grp_size = grp_size + 1;
              var remainder = grp_size % TRANS_GROUP_SIZE;
              if (!(remainder)) {
                return curr_rowV_index =
                       aLemmasRowsValue[l_index].push(mapTranslations[lemma][sense]) -
                       1;
              }
              else {
                // remove the translation sense info as there are now several and they could be contradictory
                // one could also concatenate them, maybe later
                aLemmasRowsValue[l_index][curr_rowV_index].translation_sense =
                "";
                aLemmasRowsValue[l_index][curr_rowV_index].sense =
                (add_if_not_empty(aLemmasRowsValue[l_index][curr_rowV_index].sense, SENSE_SEP) +
                 sense)
                  .replace(PREFIX_CHAR, '');
              }
            });
          });
          // now aLemmas should have for each lemma the list of senses in rowsValue
          var aValuesReduced = [];
          aLemmasRowsValue.forEach(function ( _aLemmasRowsValue ) {
            _aLemmasRowsValue.forEach(function flatmap ( lemmaRowValue ) {
              aValuesReduced.push(lemmaRowValue);
            })
          });
          return aValuesReduced;
          // TODO : now group the lemmas
        },

        compute_position : function compute_position ( x, y, tt, ttOuterWidth, ttOuterHeight ) {
          var pos = {};
          var margin = 5;
          var anchor = 10;

          // show popup to the right of the word if it fits into window this way
          if (x + anchor + tt.outerWidth(true) + margin <
              $(window).width()) {
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
          else if (y + anchor + tt.outerHeight(true) + margin <
                   $(window).height()) {
            pos.y = y + anchor;
          }
          // show popup at the very top of the window
          else {
            pos.y = margin;
          }

          return pos;
        }
      },
      //    channel: {name: 'tooltip_channel'},
      name               : 'TranslationTooltip'
    });

  return RV = {
    ReaderToolComponent      : ReaderToolComponent,
    Component_Tooltip        : Component_Tooltip,
    Component_TT_Translation : Component_TT_Translation,
    Component_TT_Input       : Component_TT_Input,
    TranslationTooltip       : TranslationTooltip
  };
});
