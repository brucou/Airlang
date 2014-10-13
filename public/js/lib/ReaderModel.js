/**
 * Created by bcouriol on 5/06/14.
 */

/**
 * TODO : CODE QUALITY
 * - refactoriser ulr_load hors du callback pour faciliter le testing
 * - je dois etre capable de faire rentrer n'importe quel source html directement
 * TODO : FEATURES
 * - disable click on links anyways - interacts with word info functionality
 * - STYLE : add some style for code div

 * nice to have : treat wikipedia as a special case. More special cases? http://en.wikipedia.org/wiki/Perranzabuloe
 * TODO : BUGS
 * issue : treat the case of text in div with no class or id (http://www.praha3.cz/noviny/akce-mestske-casti/vinohradske-vinobrani-nabidne-produkty.html)
 * issue : analyse why some paragraphs are not parsed : http://prazsky.denik.cz/zpravy_region/lenka-mrazova-dokonalost-je-moje-hodnota-20140627.html
 * issue : better support for language-dependant punctuation signs and idiosyncrasy (... vs . etc.)
 */
/**
 * Lessons learnt:
 * Promises :
 * - Differentiate the promise and the differed. The promise is returned from the function and is extracted from the differed
 * - Be careful when reusing code whether promise or value, in simple cases OK ($.when...), in other cases, plan for
 * - - sync: RETURN value
 * - - async : dfr.resolve(xxx) sufficient
 * - Generally speaking, use promise anywhere there is asynchronous function calls. That should help unify the thinking
 * - could be interesting to look at a library which allows switching from callback to promises
 * - DEBUGGING : state() function of deferred give the state ("pending", "resolved"). So pass the promise in global to look
 */

define(['jquery', 'data_struct', 'url_load', 'utils', 'socketio', 'cache'],
       function ( $, DS, UL, UT, IO, CACHE ) {

          var RM = {}; // Added so I can trace all member functions more easily
          var CLASS_SELECTOR_CHAR = ".";
          var ID_SELECTOR_CHAR = "#";
          var highlight_words;

          var COMMENT_START_TOKEN = "<";
          var COMMENT_END_TOKEN = ">";

          const qry_translation_CACHE_SIZE = 1000; //max 1000 keys (frequent words) for this cache
          const qry_translation_CACHE_LOG = true;

          var qry_cache_options = {
             expirationAbsolute : null,
             expirationSliding  : 60 * 1500,
             priority           : Cache.Priority.HIGH,
             callback           : function ( k, v ) {
                console.log('key removed from cache :' + k);
             }};
          var localCache = new CACHE.LocalStorageCacheStorage('qry_translation_cache');
          logWrite(DBG.TAG.DEBUG, "localcache", UT.inspect(localCache));

          var qry_translation_cache = new CACHE(qry_translation_CACHE_SIZE, qry_translation_CACHE_LOG, localCache,
                                                qry_cache_options);

          //       put in config file somewhere which can be read by both server and client
          const StartSel = "<span class = 'highlight'>";
          const StartSel_nospaces = StartSel.replace(/ /g, "_");
          const StopSel = "</span>";
          const StopSel_nospaces = StopSel.replace(/ /g, "_");

          ////////// Database query functions
          RM.srv_qry_word_translation = function srv_qry_word_translation ( word, callback ) {
             //logEntry("srv_qry_word_translation");
             rpc_socket.emit('get_translation_info', word, callback);
             //logExit("srv_qry_word_translation");
          };

          RM.srv_qry_important_words = function srv_qry_important_words ( word, callback ) {
             /*
              Word: the word to question the server with
              callback: executed when the server has finished its processing
              */
             //logEntry("srv_qry_important_words");
             rpc_socket.emit('highlight_important_words', word, callback);
             return $.Deferred();
             //logExit("srv_qry_important_words");
          };

          RM.srv_qry_stop_words = function srv_qry_stop_words ( text, callback ) {
             /*
              Words: the words to question the server with
              callback: executed when the server has finished its processing
              */
             //logEntry("srv_qry_stop_words");
             //rpc_socket.emit('highlight_stop_words', text, callback);
             //return $.Deferred();
             if (text.indexOf("Shaangu") >= 0) {
                text = text.replace("Shaangu", "<span class = 'highlight'>Shanngu</span>");
             }
             console.log("text stop words", text);
             return text;
             //logExit("srv_qry_stop_words");
          };

          RM.highlight_words = UT.async_cached(RM.srv_qry_important_words, null); // no caching
          RM.highlight_stop_words = RM.srv_qry_stop_words;
          RM.cached_translation = UT.async_cached(RM.srv_qry_word_translation, qry_translation_cache);

          ////////// Text processing functions
          RM.make_article_readable = function make_article_readable ( your_url ) {
             var dfr = $.Deferred(); // to handle async results

             // TEST CODE
             if (FAKE.should_be(RM.make_article_readable)) {
                return FAKE(RM.make_article_readable, this)(dfr, url_load_callback, your_url);
             }
             ///////
             UL.url_load(encodeURI(your_url), url_load_callback);
             return dfr.promise();

             function url_load_callback ( html_text ) {
                if (html_text) { // the query did not fail to return a non-empty text
                   // TEST CODE
                   if (FAKE.should_be(url_load_callback)) {
                      logWrite(DBG.TAG.INFO, "TEST MODE - page highlighted!");
                      html_text = FAKE(url_load_callback, this)(dfr, html_text);
                   }
                   ///////
                   var extract_promise = RM.extract_relevant_text_from_html(html_text);

                   if (!extract_promise) {
                      // nothing to display as no selected div were found
                      logWrite(DBG.TAG.ERROR, "null returned from extract_relevant_text_from_html",
                               "nothing to display");
                      dfr.reject(new DS.Error("<p> ERROR : nothing to display </p>" +
                                              "<p> Possible cause : no important paragraph could be identified </p>"),
                                 null);
                      return;
                   }

                   extract_promise
                      .done(function ( err, html_text ) {
                               logWrite(DBG.TAG.INFO, "page highlighted!");
                               //console.log("highlightd text: ", html_text);
                               dfr.resolve(err, html_text);
                            })
                      .fail(function ( err, result ) {
                               logWrite(DBG.TAG.ERROR, "error in return from extract_relevant_text_from_html");
                               dfr.reject(new DS.Error(["<p> ERROR :", err.toString(), "</p>"].join(" ")),
                                          null);
                            });
                }
                else {
                   logWrite(DBG.TAG.ERROR, "no html_text from url_load");
                   dfr.reject(new DS.Error("<p> ERROR : could not retrieve the webpage </p>"), null);
                }
             }
          }

          RM.extract_relevant_text_from_html = function extract_relevant_text_from_html ( html_text ) {
             /*
              LIMITATION : Will not work for pages who have paragraph directly under body
              This case is currently considered pathological and ignored
              IMPROVEMENT : look if there is an article tag, in which case take the title and add it first with H1 tag before constructing the page
              */
             //logEntry("extract_relevant_text_from_html");
             var MIN_SENTENCE_NUMBER = 7;
             var MIN_AVG_AVG_SENTENCE_LENGTH = 13;
             var SOURCE = "source"; //for temporarily keep the loaded webpage
             var DEST = "destination";

             var $source = RM.create_div_in_DOM(SOURCE).html(html_text);
             $source.hide();
             $source.appendTo($("body")); //apparently it is necessary to add it to body to avoid having head and doctype etc tag added
             var $dest = RM.create_div_in_DOM(DEST);

             logWrite(DBG.TAG.INFO, "Compute tag stats");
             var aData = RM.generateTagAnalysisData($source);

             /* A.
              for each div:
              for each paragraph in that div
              number of sentences and avg. of avg words per sentences
              Take all divs satisfying those conditions:
              sum #sentences > min number (language dependent)
              #avg #avg_xx > min number (language dependent)
              */
             /* A1.
              First compute the tag and text stats grouped by div
              */
             logWrite(DBG.TAG.INFO, "Compute tag stats grouped by div");
             var aDivRow = RM.compute_text_stats_group_by_div(aData);

             /* we finished exploring, now gather the final stats (averages)
              */
             logWrite(DBG.TAG.INFO, "We finished exploring, now gather the final stats (averages)");
             var i;
             for (i = 0; i < aDivRow.length; i++) {
                aDivRow[i].avg_avg_sentence_length =
                aDivRow[i].sum_avg_sentence_length / aDivRow[i].count_avg_sentence_length;
             }

             /* Identify the div classes to keep in the DOM */
             logWrite(DBG.TAG.INFO, "Identify the div classes to keep in the DOM");
             var selectedDivs = RM.select_div_to_keep(aDivRow, MIN_SENTENCE_NUMBER, MIN_AVG_AVG_SENTENCE_LENGTH);
             if (selectedDivs.length === 0) {
                logWrite(DBG.TAG.WARNING, "no div selected!!");
                logExit("extract_relevant_text_from_html");
                return null;
             }

             logWrite(DBG.TAG.INFO, "Reading and adding title");
             RM.read_and_add_title_to_$el($source, $dest);

             logWrite(DBG.TAG.INFO, "Highlighting important words");
             var dfr = $.Deferred();
             var prm_success = RM.highlight_important_words(selectedDivs, $dest);
             prm_success
                .done(function ( $el ) {
                         //following pattern function(err, result)
                         // if was successfully highlit then pass the $dest that was modified in place
                         logWrite(DBG.TAG.INFO, "done processing highlight_important_words");
                         logWrite(DBG.TAG.DEBUG, "dest", $dest.html().substring(0, 300));

                         dfr.resolve(null, $dest.html());
                         //$dest.empty();
                      })
                .fail(function ( error ) {
                         // this happens if one of the selectedDivs provokes an error
                         logWrite(DBG.TAG.WARNING, "error occurred while processing highlight_important_words");
                         dfr.reject(error, null);
                      });
             $source.remove();

             //logExit("extract_relevant_text_from_html");
             return dfr.promise();
             //           return $dest;
          };

          RM.compute_text_stats_group_by_div = function compute_text_stats_group_by_div ( aData ) {
             /*
              @param aData {array} TODO
              @returns {array}
              */
             var aDivRow = []; // contains stats for each div
             var i; // loop variable
             for (i = 0; i < aData.length; i++) {
                var pdStatRow = aData[i]; //ParagraphData object
                var div = pdStatRow.enclosing_div;
                var tagName = pdStatRow.tag;
                logWrite(DBG.TAG.DEBUG, "i, div, tagName", i, div, tagName);

                if (tagName) {// TEST!! we only compute summary stats for some tags
                   var iIndex = UT.getIndexInArray(aDivRow, "div", div);

                   if (iIndex > -1) { // div class already added to the stat array
                      aDivRow[iIndex].sum_sentence_number += pdStatRow.sentence_number;
                      aDivRow[iIndex].sum_avg_sentence_length += pdStatRow.avg_sentence_length;
                      aDivRow[iIndex].count_avg_sentence_length += 1;
                   }
                   else { // first time seen that div class, so add it to the stat array
                      aDivRow.push({div : div, sum_sentence_number : pdStatRow.sentence_number, sum_avg_sentence_length : pdStatRow.avg_sentence_length, count_avg_sentence_length : 1});
                   }
                }
             }
             return aDivRow;
          }

          RM.select_div_to_keep =
          function select_div_to_keep ( aDivRow, MIN_SENTENCE_NUMBER, MIN_AVG_AVG_SENTENCE_LENGTH ) {
             /**
              @param aDivRow {array} array of div elements from the page to analyze
              @returns {array} filtered array with only the div elements to keep for presentation, e.g. the important text
              */
             var selectedDivs = [];
             var pdStatRowPartial, i;
             for (i = 0; i < aDivRow.length; i++) {
                pdStatRowPartial = aDivRow[i]; //ParagraphData object
                if (pdStatRowPartial.sum_sentence_number >= MIN_SENTENCE_NUMBER &&
                    pdStatRowPartial.avg_avg_sentence_length >= MIN_AVG_AVG_SENTENCE_LENGTH)
                {
                   // that div is selected candidate for display
                   selectedDivs.push(pdStatRowPartial);
                   logWrite(DBG.TAG.INFO, "keeping div class, sentence_number, avg w/s", pdStatRowPartial.div,
                            pdStatRowPartial.sum_sentence_number, pdStatRowPartial.avg_avg_sentence_length);
                }
                else {
                   logWrite(DBG.TAG.INFO, "discarding div class, sentence_number, avg w/s", pdStatRowPartial.div,
                            pdStatRowPartial.sum_sentence_number, pdStatRowPartial.avg_avg_sentence_length);

                }
             }
             return selectedDivs;
          }

          RM.highlight_important_words = function highlight_important_words ( aSelectedDivs, $dest ) {
             /*
              for each element of the array of selected div elements, highlight its text content
              then put the result in the destination DOM element
              The DOM takes the el from its source and (RE)MOVES it to the destination
              issue : might be necessary to have a special treatment for div with no classes AND no id selectors
              */
             var pdStatRowPartial;
             var i;

             //var controlDeferred = $.Deferred();
             var aPromises = []; //array of deferred for async function calls

             for (i = 0; i < aSelectedDivs.length; i++) {
                pdStatRowPartial = aSelectedDivs[i];
                var div_selector = pdStatRowPartial.div;
                if (div_selector.length === 0) {
                   // this is pathological case, where the relevant text is directly under the body tag
                   // that should not happen as we are always under body under that version of the algorithm
                   // so just warns in console
                   logWrite(DBG.TAG.WARNING, "div_selector is empty, ignoring");
                   continue;
                }

                logWrite(DBG.TAG.INFO, "Highlighting important words on text from", div_selector);
                var $div_selector = $(div_selector);
                aPromises.push(RM.highlight_text_in_div($div_selector)); //adds another promise to the array
                $div_selector.appendTo($dest);
             }
             return $.when.apply($, aPromises); // return the promise monitoring parallel execution
          };

          RM.highlight_text_in_div = function highlight_text_in_div ( $el ) {
             /**
              * Highlights important words found in $el,
              * Works by wrapping all text between given set of tags in a span class
              * and later analyze text in each children tag of $el for important words
              */
             //logEntry("highlight_text_in_div");

             var aHighlightPromises = [];

             // Get all elements to be highlit
             var a$elToHighlight = RM.search_for_text_to_highlight($el);
             logWrite(DBG.TAG.DEBUG, "size array element to highlight", a$elToHighlight.length);

             a$elToHighlight.forEach(function ( $el, index, array ) {
                if ($el.text().trim().length === 0) {//dealing with empty or null string
                   return;
                }
                aHighlightPromises.push(RM.highlight_proper_text($el));
             });

             //logExit("highlight_text_in_div");
             return $.when.apply($, aHighlightPromises);
          };

          RM.highlight_proper_text = function highlight_proper_text ( $el ) {
             /**
              * Highlights important words found in sWords, and signals them in $el
              * Important : this function expects to be called with a normal text, e.g. no html tags
              * If html tags are present, they will be parsed as regular text
              @param sWords {String}: sentence whose words are to be highlit
              @param $el {Object}: jQuery element that contains sWords in its inner text
              @param then_callback {function} : callback executed after words habve been highlighted
              */
             return $.when(RM.apply_highlighting_filters_to_text($el.text().trim(),
                                                                 [RM.highlight_words
                                                                    , RM.highlight_stop_words
                                                                 ]))
                .then(function ( highlighted_text ) {
                         $el.html(highlighted_text);
                         return highlighted_text; // will get passed to the done callback of the promise (not used here)
                      });
          };

          RM.search_for_text_to_highlight = function search_for_text_to_highlight ( $el, a$elToHighlight ) {
             //logEntry("search_for_text_to_highlight");
             var TEXT_SELECTORS = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li"].join(", ");

             $("script", $el).remove();
             $("head", $el).remove();
             $("iframe", $el).remove();
             $("header", $el).remove();

             // first call of function is without a$elToHighlight param, subsequent calls have param
             a$elToHighlight = a$elToHighlight || [];

             // text_selectors cannot have SPAN inside, otherwise it will recurse infinitely
             // Wrap a span tag around text nodes for easier modification
             // remove text_selectors filter, do it for all tags, except for span -> cf. filter function application
             $(TEXT_SELECTORS, $el).contents().filter(function () {
                // filter all the noise of spaces that are converted to Node_text elements
                return (this.nodeType !== 1) && (this.nodeType === 3) && (clean_text(this.textContent).length > 0);
             }).wrap("<span></span>").end().filter("br").remove(); //TODO : test on a text with br elements (old web pages)

             var length = $el.children().length;
             if (length == 0) {
                logWrite(DBG.TAG.DEBUG, "processing element without child", $el.tagName, $el.text());
                a$elToHighlight.push($el);
             }
             else {
                // go through recursively into the children
                logWrite(DBG.TAG.DEBUG, "", "tag", $el.get(0).tagName, "has ", length, "children", "processing them");
                $el.children().each(function () {
                   RM.search_for_text_to_highlight($(this), a$elToHighlight);
                });
             }

             //logExit("search_for_text_to_highlight");
             return a$elToHighlight;
          };

          RM.generateTagAnalysisData = function generateTagAnalysisData ( $source ) {
             /**
              INPUT:
              @param $source {jquery element} the id of the div source within which to select the text
              @returns {array} returns an array with text stats in ParagraphData object (div class, sentence number etc.)
              */
                //logEntry("generateTagAnalysisData");
             DBG.LOG_INPUT_VALUE('$source', $source);

             var tagHTML = ["p"/*, "h1", "h2", "h3", "h4", "h5", "h6"*//*, "li"*/].join(", ");
             // table tags and spans should not be among those tags as it would affect the accurate counting of sentences.
             // table tags : a lots of single words would lower dramatically the average sentence number
             // span tags : One sentence can be separated into several span which falsify the counting
             var aData = []; // array which will contain the analysis of text paragraphs

             // Do clean-up of in-the-way tags
             var el_source = $source[0];
             $("script", el_source).remove();
             $("meta", el_source).remove();
             $("link", el_source).remove();
             $("iframe", el_source).remove();

             /* For each paragraph, calculate a series of indicators
              number of sentences
              average length of sentences in words
              number of links
              the first enclosing div
              */
             logWrite(DBG.TAG.DEBUG, "Computing stats on text with tags", tagHTML);
             $(tagHTML, el_source).each(get_tag_stat);

             //logExit("generateTagAnalysisData");
             DBG.LOG_RETURN_VALUE(aData);
             return aData;

             function get_tag_stat ( index, element ) {
                // I have to put it inside that bloc to have aData available in the closure
                // that makes it harder to test it separately
                // called from a DOM object, in an each context
                // that means this refers to the DOM element, NOTE: the DOM element, not the jQuery version
                var paragraghData = new DS.ParagraphData();
                switch (element.nodeType) {
                   case 1: //Represents an element
                      // look for nodename and do something
                      var tagName = element.tagName;

                      var parentTagName = $(this).parent()[0].tagName;
                      //logWrite(DBG.TAG.DEBUG, "element read", tagName, element.id, element.textContent);
                      //logWrite(DBG.TAG.DEBUG, "element parent", parentTagName);

                      // this portion of code ensure that value in tables do no count towards the stats
                      // if they would, table elements with one number would dramatically lower the average of words
                      // per sentence, hence a greater likelihood of excluding paragraphs
                      //var isTableContent =  ? "false" : "true";
                      if (parentTagName.search("T") !== -1) {
                         break;
                      }

                      var hierarchy = $(this).parentsUntil("body", "div") || [$("body")]; //!! to test! if no div enclosing, then body is used
                      var div = $(hierarchy[0]); // By construction can't be null right?

                      paragraghData.$el = $(this);
                      paragraghData.tag = tagName;
                      paragraghData.text = element.textContent;
                      if (paragraghData.text === "") {
                         logWrite(DBG.TAG.WARNING, "text in element is empty : ignoring");
                         break;
                      }

                      var text_stats = get_text_stats(paragraghData.text);
                      if (text_stats.avg_sentence_length === 0) {
                         // we don't count sentences with no words inside
                         break;
                      }
                      paragraghData.sentence_number = text_stats.sentence_number;
                      paragraghData.avg_sentence_length = text_stats.avg_sentence_length;
                      paragraghData.enclosing_div_id = (typeof div.attr("id") === "undefined") ? "" : div.attr("id");
                      paragraghData.enclosing_div_class =
                      (typeof div.attr("class") === "undefined") ? "" : div.attr("class");
                      paragraghData.enclosing_div =
                      RM.get_DOM_select_format_from_class(paragraghData.enclosing_div_id,
                                                          paragraghData.enclosing_div_class);//we have to take care of the case with several classes

                      aData.push(paragraghData);
                      break;

                   case elem.TEXT_NODE: //Represents textual content in an element or attribute
                      // that case should never happen because of the processing done prior to the call (wrap in span tags)
                      // for the sake of completeness we could define it though
                      logWrite(DBG.TAG.WARNING, "text", element);
                      break;

                   default:
                      //do nothing
                      logWrite(DBG.TAG.WARNING, "do nothing");
                }
             }
          }

          ////////// Helper functions
          RM.get_DOM_select_format_from_class = function get_DOM_select_format_from_class ( div_id, div_class ) {
             /**
              * This function return a selector from div_id, div_class parameter
              * For example: <div id=article class= summary    large  > -> #article.summary.large
              * @param div_id {string}
              * @param div_class {string}
              * @type {string}
              */
             var id_part = (div_id !== "") ? ID_SELECTOR_CHAR + div_id : "";
             var class_part = (div_class !== "") ?
                              [CLASS_SELECTOR_CHAR, clean_text(div_class).replace(/ /g, CLASS_SELECTOR_CHAR)].join("") :
                              "";
             return [id_part, class_part].join("");
          };

          RM.read_and_add_title_to_$el = function read_and_add_title_to_$el ( $source, $dest ) {
             // read the title tag from $source element and set it to $dest element
             logWrite(DBG.TAG.DEBUG, "title", $("title", $source).text());
             $dest.append($("<div id='article' class='title'/>"));
             var $dTitle = $("#article.title", $dest);
             var $title = $("title", $source);
             $dTitle.text($title.text());// praying that there is only 1 title on the page...
          };

          RM.create_div_in_DOM = function create_div_in_DOM ( div_id ) {
             /* Create div element to hold the result
              If already existing, empty them
              */
             var $div = $("#" + div_id);
             $div.empty();
             if ($div.length !== 0) {
                logWrite(DBG.TAG.WARNING, "html_text_to_DOM: already existing id. Was emptied", div_id);
                $div.remove();
             }

             $div = $("<div id='" + div_id + "'/>");
             return $div;
          };

          RM.is_comment_start_token = function is_comment_start_token ( token ) {
             return (token === COMMENT_START_TOKEN);
          };

          RM.is_comment_end_token = function is_comment_end_token ( token ) {
             return (token === COMMENT_END_TOKEN);
          };

          RM.fn_filter_highlight_comment = function fn_filter_highlight_comment ( token ) {return token;};

          RM.simple_tokenizer = function simple_tokenizer ( text ) {
             /**
              * Tokenizer :   text => [token] (word array)
              */
             return text.split(" ");
          };

          RM.simple_detokenizer = function simple_detokenizer ( aTokens ) {
             return aTokens.join(" ");
          };

          RM.dataAdapterOStore2TokenActionMap = function dataAdapterOStore2TokenActionMap ( aStore ) {
             // fn_highlight functions
             var highlit_text = aStore.toString();
             logWrite(DBG.TAG.DEBUG, "highlit_text", highlit_text);
             // TODO: to synchronize better with server instead of copying :
             highlit_text = highlit_text.replace(new RegExp(StartSel, "g"), StartSel_nospaces);
             highlit_text = highlit_text.replace(new RegExp(StopSel, "g"), StopSel_nospaces);
             // For StopSel not necessary as there is no spaces
             // This manipulation ensures that whatever the StartSel, I will have the beginning and end
             // delimited by StartSel and StopSel without adding any token (tokens are space delimited under
             // the simple tokenizer methods
             var adapter = DS.get_data_adapter('text', 'token', 'simple_tokenizer');
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
                   aTokenActionMap.push({token : word, action : RM.fn_html_highlight});
                   mark = false;
                }
                else if (mark === true) {
                   logWrite(DBG.TAG.DEBUG, "associating action highlight to word ", word);
                   aTokenActionMap.push({token : word, action : RM.fn_html_highlight});
                }
                else {
                   //logWrite(DBG.TAG.DEBUG, "associating action none to word ", word);
                   aTokenActionMap.push({token : word, action : RM.default_filter});
                }

             });

             return aTokenActionMap;
             //$el.html(highlit_text);
          };

          RM.apply_highlighting_filters_to_text = function apply_highlighting_filters_to_text ( text, aFilters ) {
             /**
              * Purpose   : highlight words in a text
              * Input : text without formatting | array of highlighting filters
              * @param{String} text : character string to be highlighted
              * @param{array} aFilters : array of filter functions to be applied.
              *                          Filters' index in array is a decreasing function of priority of application.
              *                          i.e. aFilters[0] takes precedence over aFilters[1]
              * Output : string representing the highlighted text
              * Assumption : - Filter function do not add or remove token, and do not change token order,
              *                i.e. modifies token in place or leave them intact
              *              - The text passed in parameter is trimmed
              */

             /*
              1. Tokenize input text
              Tokenizer :   text => [token] (word array)
              */
             var dfr = $.Deferred();
             var aTokens = RM.simple_tokenizer(text);
             aTokens.type = 'token';
             logWrite(DBG.TAG.DEBUG, "tokens", UT.inspect(aTokens, null, 3));

             /*
              2. Identify and filter out comment tokens
              */
             var aCommentPos = [];
             var elemPos = {};

             function reset ( elemPos ) {
                elemPos.pos = undefined;
                elemPos.aCommentToken = [];
             }

             reset(elemPos);
             var commentParseState = false;
             var justFoundCommentStartToken = false;

             aTokens.forEach(
                function ( token, index, array ) {
                   justFoundCommentStartToken = false;
                   if (RM.is_comment_start_token(token)) {
                      commentParseState = true;
                      // state variable which indicates that we are going to read the content between comment tokens
                      justFoundCommentStartToken = true;
                      // this is necessary for the case when comment token is delimited by the same characters

                      elemPos.pos = index;
                   }

                   if (commentParseState == true) {
                      // keeping this in between allows to write in the array both begin and end comment token
                      elemPos.aCommentToken.push({token : token, action : RM.fn_filter_highlight_comment});
                   }

                   if (!justFoundCommentStartToken && RM.is_comment_end_token(token)) {
                      aCommentPos.push(clone(elemPos));
                      commentParseState = false;
                      reset(elemPos);
                      function clone ( elemPos ) {
                         return {
                            pos           : elemPos.pos,
                            aCommentToken : elemPos.aCommentToken
                         }
                      }
                   }

                });
             // expect aToken to have the array with comment indexes ([token]  =>  [pos, [{tokens_commented, 'comment'}]])

             logWrite(DBG.TAG.DEBUG, "comment table", UT.inspect(aCommentPos, null, 4));
             // Now remove the comment tokens from the input
             aCommentPos.forEach(
                function ( elemPos, index, array ) {
                   aTokens.splice(elemPos.pos, elemPos.aCommentToken.length);
                });

             /*
              3. For each filter : apply filter to commented out tokens:
              */
             var aPromises = RM.getTokenActionMap(aTokens, aFilters);
             $.when.apply($, aPromises).then(
                function ( /*arguments is each of the token_action_map type returned by filters*/ ) {
                   // Note : the when function concatenate resolution of deferred in the same order than they were called
                   // e.g. in the same order than the array of filters
                   var aFilterResults = Array.prototype.slice.call(arguments);
                   console.log("aFilterResults", aFilterResults);

                   // - [ [{token, action}]_token ]_filter  =>  [ {token, [action]_filter}  ]_token   (function transposition)
                   // Prepare the transposed object to receive the transposed values
                   // all filters have worked on the same tokens and did not change them,
                   // so we can safely use the token from the first filter
                   var aTransposedResults = [];
                   aFilterResults[0].forEach(function ( tokenActionMap, index ) {
                      aTransposedResults[index] = {};
                      aTransposedResults[index].token = tokenActionMap.token;
                      aTransposedResults[index].aActions = [];
                   });

                   // Transpose results
                   aFilterResults.forEach(function ( aTokenActionMap, aF_index ) {
                      aTokenActionMap.forEach(function ( tokenActionMap, aT_index ) {
                         aTransposedResults[aT_index].aActions[aF_index] =
                         tokenActionMap.action;
                      });
                   });
                   //logWrite(DBG.TAG.DEBUG, "aTransposedResults transpose", UT.inspect(aTransposedResults, null, 4));

                   /*
                    4. Take the output of each filter and apply precedence rules
                    i.e. keep highlighting made by higher priority filter
                    For text without any highlight, the default filter applies last
                    */
                   // - [ {token, [action]_filter}  ]_token  =>  [{token, action_final}]_token where :
                   // - - action_final = [action].reduce ((action_a, action_b) -> action_a !== default_filter  ?  action_a  :  action_b)
                   aTransposedResults.forEach(function ( transposedResult ) {
                      // this code actually keeps the first action which is not default
                      transposedResult.action =
                      transposedResult.action_final =
                      transposedResult.aActions.reduce(function ( action_a, action_b ) {
                         return action_a.name !== RM.default_filter.name ?
                                action_a :
                                action_b;
                      })
                   });
                   logWrite(DBG.TAG.DEBUG, "aTransposedResults action reduce",
                            UT.inspect(aTransposedResults, null, 4));

                   /*
                    * 5. Replace the comment tokens inside the original text
                    */
                   // reminder aCommentPos = [pos, aCommentToken] or [pos, [commentToken]] or [pos, [{token, action}]]
                   aCommentPos.forEach(function ( elemPos, index ) {
                      var pos = elemPos.pos;
                      var aToInsert = elemPos.aCommentToken;
                      // insert in aTransposedResults same pos
                      // beware the trap, this modifies directly in place, value returned is element removed
                      UT.injectArray(aTransposedResults, aToInsert, pos);
                   });
                   //logWrite(DBG.TAG.DEBUG, "aTransposedResults include comments", UT.inspect(aTransposedResults, null, 4));

                   // Apply filter selected
                   // [{token, action_final}]  =>  [token_filtered]
                   var aTokensActedOn = [];
                   aTransposedResults.forEach(function ( transposedResult ) {
                      aTokensActedOn.push(transposedResult.action.call(null,
                                                                       transposedResult.token));
                   });
                   //logWrite(DBG.TAG.DEBUG, "aTokensActedOn", UT.inspect(aTokensActedOn, null, 4));

                   /*
                    * 6. Detokenize
                    */
                   var i_adapter = DS.get_data_adapter('token', 'text');
                   console.log("executing i_adapter ", i_adapter.name);

                   var final_output = i_adapter(aTokensActedOn);
                   logWrite(DBG.TAG.DEBUG, "final_output",
                            UT.inspect(final_output, null, 4));

                   dfr.resolve(final_output);
                });

             return dfr.promise();
          };

          RM.getTokenActionMap = function getTokenActionMap ( aTokens, aFilters ) {
             // [filter], [token]  =>  [ [{token, action}]_token ]_filter
             // aFilters: array of REGISTERED filters. If the filter is not registered, fields will be missing and it will not work!!
             var aFilterResults = [];
             var aPromises = [];

             aFilters.forEach(
                function ( filter, index, array ) {
                   logWrite(DBG.TAG.DEBUG, "analysis of token by filter", UT.inspect(filter, null, 2));
                   if (!filter.input_type || !filter.output_type) {
                      throw 'getTokenActionMap: type information not available. Possible cause is filter was not registered'
                   }

                   //var dfr = $.Deferred();
                   //aDeferred.push(dfr.promise());

                   var i_adapter = DS.get_data_adapter(aTokens.type || 'token', filter.input_type);
                   var o_adapter = DS.get_data_adapter(filter.output_type, 'token_action_map');
                   logWrite(DBG.TAG.DEBUG, "executing filter ", filter.filter_name, "with tokens", aTokens);

                   var deferred_or_value =
                          DS.promise_value_adapter(
                             filter.call(null, i_adapter(aTokens), result_callback),
                             result_callback);

                   function result_callback ( err, result ) {
                      // if the filter is not asynchronous, it must not expect nor use a second argument
                      // is asynchronous, it must have a second argument
                      // the oDeferred here must be the same deferred returned by the filter call
                      // another technique is to call the callback in the context of the object containing the deferred
                      // however not recommended because it is dangerous to use this that way
                      if (err) {
                         logWrite(DBG.TAG.ERROR,
                                  "getTokenActionMap: error returned by filter ",
                                  filter.filter_name,
                                  err);
                         deferred_or_value.reject(["error in highlight words",
                                                   err].join(" : "));
                      }
                      else {
                         //associate one action to each token
                         logWrite(DBG.TAG.DEBUG,
                                  "executing output adapter",
                                  o_adapter.name ||
                                  o_adapter.displayName);
                         var aMapTokenAction = o_adapter(result);
                         //logWrite(DBG.TAG.DEBUG, "returning aMapTokenAction", UT.inspect(aMapTokenAction, null, 4));

                         //push the result in the result array
                         //aFilterResults.push(aMapTokenAction);

                         // the return here si important for the case where deferred_or_value is a value
                         // In that case, we do not have access to a resolve mechanism for tranfering value out
                         return deferred_or_value.resolve(aMapTokenAction);
                      }
                   }

                   aPromises.push(deferred_or_value.promise());
                   // filter returns either a plain object or a promise/deferred. In any case that is stored
                });
             window.aPromises["filters"].push(aPromises);
             return aPromises;
          };

          RM.fn_html_highlight = function fn_html_highlight ( token ) {
             return [StartSel, token, StopSel].join("");
          };

          RM.default_filter = function default_identity_filter ( token ) {// id function
             return token;
          };

          RM.init = function init () {
             DS.register_data_adapters('text', 'token', RM.simple_tokenizer);
             DS.register_data_adapters('token', 'text', RM.simple_detokenizer);
             DS.register_filter('text', 'async_cached_postgres_highlighted_text', RM.highlight_words);
             DS.register_filter('text', 'async_cached_postgres_highlighted_text', RM.highlight_stop_words);
             DS.register_data_adapters('async_cached_postgres_highlighted_text', 'token_action_map',
                                       RM.dataAdapterOStore2TokenActionMap);
          };

          /*return {//that's the object returned only for requirejs, e.g. the visible interface exposed
           extract_relevant_text_from_html: extract_relevant_text_from_html,
           highlight_important_words      : highlight_important_words,
           cached_translation             : cached_translation,
           make_article_readable          : make_article_readable
           };*/
          RM.init();
          return RM;
       });
