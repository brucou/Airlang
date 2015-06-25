/**
 * Created by bcouriol on 17/09/14.
 */
   //TODO : when movingto RxJS, don't forget to copy the version of rx.all where error handling show stack for debugging
define(['debug',
        'jquery',
        'rsvp',
        'socket',
        'readerModel',
        'TranslateController',
        'stateful',
        'data_struct',
        'utils'],
       function ( DBG, $, RSVP, SOCK, RM, TC, STATE, DS, UT ) {
          // logger
          var log = DBG.getLogger("RC");
          //TEST CODE
          trace(RM, 'RM');
          //trace(TC, 'TC');
          //trace(DS, 'DS');
          ////////////
          var RC = {};
          rtView = RC.rtView = can.view('tpl-reader-tool-stub');

          RC.view = {
             template    : [
                '<select id="url_param">',
                '<option value=""></option>',
                '  <!--',
                '    <option value="http://www.lemonde.fr/pixels/article/2014/06/03/accueillir-snowden-en-france-les-points-cles-du-debat_4431332_4408996.h',
                '    Le monde',
                '    </option>',
                '    <option value="http://www.voxeurop.eu/cs/content/editorial/4765047-jsme-zpet">VoxEurop cs',
                '    </option>',
                '    <option value="http://mobile.nytimes.com/2014/06/07/sports/tennis/novak-djokovic-and-rafael-nadal-in-french-open-final.html">',
                '    nytimes',
                '    </option>',
                '    <!--  -->',
                '  <option value="http://stackoverflow.com/questions/6743912/get-the-pure-text-without-html-element-by-javascript">',
                '    stackflow',
                '  </option>',
                '  <option value="http://www.kolik-to-stoji.cz/kolik-vas-stoji-spotreba-elektriny/#more-85">kolik stoji spotreby elekc</option>',
                '  <option value="http://www.kolik-to-stoji.cz/kolik-stoji-notebook/">notebook stoji</option>',
                '  <option value="http://zena.centrum.cz/deti/zajimavosti/clanek.phtml?id=702818">děti stoji</option>',
                '  <option value="http://www.financninoviny.cz/zpravodajstvi/zpravy/intel-provoz-starsiho-pc-zvysi-naklady-na-energii-az-40krat/1167756">financni',
                '  <option value="http://ales-kalina.cz/blog/vztahy-blog/nesnazte-se-opravovat-nekompatibilni-vztah/">psicho idnes</option>',
                '  <option value="http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr">idnes ru</option>',
                '  <option value="http://www.voxeurop.eu/cs/content/editorial/4765047-jsme-zpet">VoxEurop cs',
                '  </option>',
                '  <option value="http://ekonomika.idnes.cz/platba-kartou-a-hotovosti-zahranici-d7j-/ekonomika.aspx?c=A140625_211824_ekonomika_maq#utm_source">idnes.cz',
                '  </option>',
                '  <option value="http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq">',
                '    ekonomika',
                '  </option>',
                '  <option value="http://prazsky.denik.cz/zpravy_region/lenka-mrazova-dokonalost-je-moje-hodnota-20140627.html">',
                '    denik',
                '  </option>',
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
                '<div id="content">{{{ webpage_readable }}}</div>'
             ].join(" "),

             /*
              Using a view adapter to have in the same place all variables which are bound in the view template
              This also allows for cleaner code in the controller...
              ...and the binding of the new controller instance when created...
              ...and not forgetting to use attr to modify those live bindings
              Another option would be to use this.options and pass the same data in an extra parameter when creating
              the controller. In my opinion, this.options distract from what is being done
              */
             viewAdapter : new
                can.Map({
                           url_to_load      : ' ',
                           webpage_readable : ' ',
                           error_message    : ' ',
                           setErrorMessage  : function ( text ) {
                              this.attr("error_message", text);
                           },
                           set_HTML_body    : function ( html_text ) {
                              this.attr("webpage_readable", html_text)
                           }
                        })
          };
          RC.view.renderer = can.mustache(RC.view.template);

          RC.ReaderToolController = can.Control.extend(
             {
                defaults : {
                   //view           : RC.rtView,
                   view : RC.view
                   //getViewAdapter : RC.getViewAdapter
                }
             },
             {
                init : function ( $el, options ) {//el already in jquery form
                   // NOTE : defaults is loaded first in options
                   var view = this.view = options.view;

                   // variable which will gather all the stateful properties
                   // setter, getter functions
                   this.stateMap = {
                      user_id           : options.user_id,
                      first_language    : options.first_language,
                      target_language   : options.target_language,
                      isUrlLoaded       : false,
                      tooltip_displayed : false,
                      note              : null,
                      range             : null,
                      lemma_target_lg   : null
                   };

                   //$el.appendChild(view.renderer(view.viewAdapter));
                   $el.html(RC.rtView(RC.view.viewAdapter));

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
                   var viewAdapter = this.view.viewAdapter,
                      my_url = $el.val(),
                      self = this;
                   viewAdapter.attr("url_to_load", my_url);
                   viewAdapter.setErrorMessage(null);
                   viewAdapter.set_HTML_body(null);

                   RM.get_stored_notes(
                      { module           : 'reader tool',
                         first_language  : this.stateMap.first_language,
                         target_language : this.stateMap.target_language,
                         user_id         : 1, //TODO : temporary, the user_id should be obtained from some login
                         url             : my_url})
                      .then(
                      function get_stored_notes_success ( aNotes ) {
                         RM.make_article_readable(my_url)
                            .fail(function make_article_readable_error ( Error ) {
                                     log.error("Error in make_article_readable", Error);
                                     viewAdapter.setErrorMessage(Error.toString());
                                     viewAdapter.set_HTML_body(null);
                                  })
                            .done(function make_article_readable_success ( html_text ) {
                                     log.info("URL read successfully");
                                     viewAdapter.set_HTML_body(html_text);
                                     viewAdapter.setErrorMessage("");
                                     self.stateSetIsUrlLoaded(true);
                                  });
                      },
                      function get_stored_notes_failure () {
                         log.error('RM.get_stored_notes', err);
                      }
                   );
                },

                '{window} al-ev-tooltip_dismiss' : function tooltip_dismiss_handler ( $el, ev ) {
                   log.event("al-ev-tooltip_dismiss", "received");
                   // Update state
                   this.stateMap.tooltip_displayed = false;
                   // Check parameters : we need min. a word, lemma and translation
                   if (!ev.translation_word || !this.stateMap.note.word || !ev.lemma_target_lg) {
                      log.warning("tooltip_dismiss_handler", "word or lemma or translation are falsy");
                      return false
                   }
                   // Add the note in the note table and visually display the annotated word
                   // TODO this.stateMap.note.word = ev.lemma_target_lg; keep word in note pad, lemma in noteweight
                   // add column lemma is both table, that's the simplest
                   this.stateMap.lemma_target_lg = ev.lemma_target_lg;
                   console.log("stateMap show and add note", this.stateMap);
                   this.show_and_add_note(this.element, this.stateMap);
                   log.sock("set_word_user_translation", "emitting");
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
                   log.event("al-ev-shown_tooltip", "received");
                   this.stateMap.tooltip_displayed = true;
                },

                'click' : function click ( $el, ev ) {
                   log.event("RC click", "received", "target", ev.target.tagName);
                   log.debug("tooltip displayed", this.stateMap.tooltip_displayed);

                   // if the click is on the dropdown select then ignore
                   if (ev.target.nodeName === 'SELECT') {return true}
                   // if already displaying the tooltip, ignore clicks out of the tooltip or bubbled up
                   if (this.stateMap.tooltip_displayed) {return false}
                   // else process according to configuration passed in options
                   ev.stopPropagation();
                   // Get all data necessary for adding the note if need be
                   // necessary to do it now, because it is based on the click selection which will change
                   // when displaying the tooltip
                   log.event("al-ev-show_tooltip", "emitting");
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
                   // this is a stub for testing
                   var range = stateMap.range || window.getSelection().getRangeAt(0);
                   // this is to eliminate possible side effects when calling from another window like tooltip for instance
                   var note = stateMap.note || RC.getNoteFromWordClickedOn($el, range);
                   stateMap.note = note; // necessary to initialize it if not yet

                   var self = this;
                   var viewAdapter = self.view.viewAdapter;
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
                         self.add_note(stateMap, viewAdapter, note)
                      ]).then(function update_html_text ( aPromiseResults ) {
                                 // update the html in reader controller
                                 var highlighted_text = aPromiseResults[0];
                                 viewAdapter.setErrorMessage(null);
                                 viewAdapter.set_HTML_body(highlighted_text);
                                 return highlighted_text;
                              });
                },

                add_note : function ( stateMap, viewAdapter, note ) {
                   return RSVP.all([
                                      RM.add_notes({module            : 'reader tool',
                                                      first_language  : stateMap.first_language,
                                                      target_language : stateMap.target_language,
                                                      url             : viewAdapter.url_to_load,
                                                      user_id         : stateMap.user_id,
                                                      word            : note.word,
                                                      lemma           : stateMap.lemma_target_lg},
                                                   {context_sentence : note.context_sentence,
                                                      index          : note.index}),
                                      RM.add_TSR_weight({user_id           : stateMap.user_id,
                                                           first_language  : stateMap.first_language,
                                                           target_language : stateMap.target_language,
                                                           // put the lemma in the list of words to TSR revise, not the declensed word
                                                           word            : stateMap.lemma_target_lg})
                                   ])
                      .then(function success_add_note ( param1, param2 ) {
                               // TODO: check success of addition through return values of promises
                               // here we return null if the (user_id, word) was already in TSR_weight
                               //generally speaking we need a system to give feedback,
                               // could be just a code whose semantics is defined at server level
                               // this will be used for cases where no ERROR is to be raised but it is relevant to give
                               // more info as per what went wrong
                               log.debug("added note remotely!")
                            },
                            function failure_add_note ( err ) {
                               log.error("failure remotely adding note", UT.inspect(err));
                            });
                },

                stateSetIsUrlLoaded : function stateSetIsUrlLoaded ( is_loaded ) {
                   this.stateMap.isUrlLoaded = is_loaded;
                },

                stateGetIsUrlLoaded : function stateGetIsUrlLoaded () {
                   return this.stateMap.isUrlLoaded;
                }

             });

          RC.helpers = {
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
             filter_selected_word : function filter_selected_word ( word, index, fn_filter ) {
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
             },

             /**
              * Purpose    : return a note object containing the word and positional information about the word being clicked on
              * ASSUMPTION : function called from within a container such as returned by the parseDomTree function
              *              i.e. with numbered html tag except for text nodes
              * @param {jQuery} $el : jQuery element clicked on (target element)
              * @param {range} selectedRange range containing the click selection made by the user
              * @return {word: {String}, index: {Number}, rootNode: {Node}, context_sentence: {String}}
              */
             getNoteFromWordClickedOn : function getNoteFromWordClickedOn ( $el, selectedRange ) {
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
             getWordIndexFromIDParent : function getWordIndexFromIDParent ( $el, selectedRange ) {

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
                var currentNode = RC.findParentWithId(startNode);
                /*TEST CODE*/
                currN = currentNode; ////////
                log.debug("current node", currentNode.nodeName, currentNode.textContent);

                // traverse tree till startNode and count words and characters while doing so
                // TODO: case currentNode = startNode not handled
                count_word_and_char_till_node(currentNode, startNode, aCharLengths, aWordLengths, RM.simple_tokenizer);

                //log.debug( "found startNode", aCharLengths.reduce(UT.sum, 0), aWordLengths.reduce(UT.sum, 0));

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
                      if (currentNode.nodeType === currentNode.TEXT_NODE || currentNode.nodeName === "BR") {
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
                      word.length + (word.length == 0 ? 1 : (array[index + 1] ? 1 : 0) );
                      return !(current_offset <= startOffset);
                   });
                }

             }
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
                //log.debug( "no id found, looking higher up");
                currentNode = currentNode.parentNode;
                ancestor_level++;
             }
             if (currentNode === null) {
                // we reached the top of the tree and we found no node with an attribute ID...
                throw 'findParentWithId: could not find a node with an ID...'
             }

             //log.debug(                      "found id in parent " + ancestor_level + " level higher : " + currentNode.getAttribute("id"));
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
             var currentNode = RC.findParentWithId(startNode);
             /*TEST CODE*/
             currN = currentNode; ////////
             log.debug("current node", currentNode.nodeName, currentNode.textContent);

             // traverse tree till startNode and count words and characters while doing so
             // TODO: case currentNode = startNode not handled
             count_word_and_char_till_node(currentNode, startNode, aCharLengths, aWordLengths, RM.simple_tokenizer);

             //log.debug( "found startNode", aCharLengths.reduce(UT.sum, 0), aWordLengths.reduce(UT.sum, 0));

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
                   if (currentNode.nodeType === currentNode.TEXT_NODE || currentNode.nodeName === "BR") {
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
                   word.length + (word.length == 0 ? 1 : (array[index + 1] ? 1 : 0) );
                   return !(current_offset <= startOffset);
                });
             }

          };

          return RC;
       })
;
