/**
 * Created by bcouriol on 17/09/14.
 */
define(['jquery',
        'ReaderModel',
        'TranslateController',
        'Stateful',
        'data_struct',
        'utils'],
       function ( $, RM, TC, STATE, DS, UT ) {
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

          RC.combo_load_url = function combo_load_url ( $el, ev ) {
             var viewAdapter = this.viewAdapter,
                my_url = $el.val(),
                self = this;
             viewAdapter.attr("url_to_load", my_url);
             viewAdapter.setErrorMessage(null);
             viewAdapter.set_HTML_body(null);

             var prm_success; // promise to manage async data reception
             // TODO: harnomize the signature of callback function to err, result with err and Error object
             prm_success = RM.make_article_readable(my_url);
             prm_success
                .fail(function make_article_readable_error ( Error ) {
                         if (Error instanceof DS.Error) {
                            logWrite(DBG.TAG.ERROR, "Error in make_article_readable", Error.error_message);
                            viewAdapter.setErrorMessage(Error.error_message);
                            viewAdapter.set_HTML_body(null);
                         }
                      })
                .done(function make_article_readable_success ( error, html_text ) {
                         logWrite(DBG.TAG.INFO, "URL read successfully");
                         viewAdapter.set_HTML_body(html_text);
                         viewAdapter.setErrorMessage("");
                         self.stateSetIsUrlLoaded(true);

                         var rtTranslateController = new TC.TranslateRTController(self.element,
                                                                                  {translate_by : 'point'});
                         // TODO: add an event that triggers refreshes of the webpage
                         // put viewAdapter in RC so it can be accessible from the shell
                         // create the controller with the view and model passed as parameters
                      });
          };

          /**
           * Purpose : filter function to highlight (via html) a word within an [html_token] structure
           * @param html_token
           * @returns {{type: string, text: string}} Returns an html_token structure
           */
          RC.fn_html_highlight_note = function fn_html_highlight_note ( html_token ) {
             return {
                type : 'text',
                text : "<span class='airlang-rdt-note-highlight'>" + html_token.text + "</span>"
             };
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

          RC.show_and_add_note = function show_and_add_note ( $el, ev, range ) {
             if (!this.stateGetIsUrlLoaded()) {
                //that flag is set after a successful load of an url
                return;
             }
             //this is a stub for testing
             range = range || window.getSelection().getRangeAt(0);

             var self = this;
             var note = TC.getNoteFromWordClickedOn($el, ev, range);
             return $.when(
                   RM.apply_highlighting_filters_to_text_2(
                      $(note.rootNode), RM.fn_parser_and_transform([], [], true),
                      [RC.filter_selected_word(note.word, note.index - 1, RC.fn_html_highlight_note)]
                   ))
                .then(function ( highlighted_text ) {
                         // update the html in reader controller
                         // TODO Also don't forget to update state data user.reader_tool.notes.mapURLNotes
                         self.viewAdapter.setErrorMessage(null);
                         self.viewAdapter.set_HTML_body(highlighted_text);
                         return highlighted_text;
                      });
          };

          RC.ReaderToolController = can.Control.extend(
             {
                defaults : {
                   view           : RC.rtView,
                   getViewAdapter : RC.getViewAdapter,
                   stateMap       : {
                      isUrlLoaded : false
                   } // variable which will gather all the stateful properties
                   // setter, getter functions
                }
             },
             {
                init : function ( $el, options ) {//el already in jquery form
                   //defaults is loaded first in options
                   this.rtView = this.options.view;
                   this.viewAdapter = this.options.getViewAdapter();
                   $el.html(this.rtView(this.viewAdapter));
                   // TODO read from database the persisted notes data user.reader_tool.notes.mapURLNotes
                   var aNotes = STATE.get_stored_stateful_object(
                      'Notes_Collection',
                      { module   : 'reader_tool',
                         user_id : 1,
                         url     : 'whatever'})
                },

                '#url_param change' : RC.combo_load_url,

                'click' : RC.show_and_add_note,

                stateSetIsUrlLoaded : function stateSetIsUrlLoaded ( is_loaded ) {
                   this.options.stateMap.isUrlLoaded = is_loaded;
                },

                stateGetIsUrlLoaded : function stateGetIsUrlLoaded () {
                   return this.options.stateMap.isUrlLoaded;
                }

             });

          return RC;
       })
;
