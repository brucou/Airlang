/**
 * Created by bcouriol on 17/09/14.
 */
define(['jquery',
        'ReaderModel',
        'TranslateController',
        'data_struct',
        'utils'],
       function ( $, RM, TC, DS, UT ) {
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

          RC.fn_html_highlight_note = function fn_html_highlight_note ( token ) {
             return "<span class='airlang-rdt-note-highlight'>" + token + "</span>";
          };

          RC.filter_selected_word = function filter_selected_word ( word, index ) {
             var filter_selected_word = function filter_selected_word ( aTokens ) {
                //returns a token action map structure with only the word in index position being acted on
                // word input parameter is used as a check that we received the right index
                // reminder tokenActionMap : {token : word, action: function | null}
                var index_non_empty = 0;
                return aTokens.map(function ( token ) {
                   if (!token.trim()) {
                      // we found some space(s)
                      return {token : token, action : null}
                   }
                   else {
                      return {token : token, action : (index === index_non_empty++) ? RC.fn_html_highlight_note : null}
                   }
                });

             };
             filter_selected_word.input_type = 'token';
             filter_selected_word.output_type = 'token_action_map';

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
             var parsedTree = UT.parseDOMtree($(note.rootNode), [], [], true);
             return $.when(
                RM.apply_highlighting_filters_to_text(
                   parsedTree.html_parsed_text,
                   [RC.filter_selected_word(note.word, note.index - 1)],
                   RM.simple_tokenizer, RM.simple_detokenizer,
                   function filter_comment_remover ( aTokens ) {
                      return parsedTree.aCommentPos;
                   }))
                .then(function ( highlighted_text ) {
                         // update the html in reader controller
                         //TODO : pass the $el element? pass the viewAdapter? How to structure?
                         // TODO Also don't forget to update state data user.redaer_tool.notes.mapURLNotes
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
