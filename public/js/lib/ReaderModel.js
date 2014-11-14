/**
 * Created by bcouriol on 5/06/14.
 */

/**
 * TODO : CODE QUALITY
 * - refactoriser ulr_load hors du callback pour faciliter le testing
 * - DOCUMENTER le code
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
 * - Also can fail silently, e.g. in case of JS error directly jump to reject without any message visible
 * JQuery :
 * - Two types of node comparison, strict comparison can be done with ===, the 'same contents' comparison with isEqualNode
 * - there is advantage in knowing how to navigate the DOM with jQuery and with the DOM API directly, lots of time wasted
 *   trying to figure out which is which
 * DOM :
 * - there is advantage in knowing how to navigate the DOM with jQuery and with the DOM API directly, lots of time wasted
 *   trying to figure out which is which
 * - lots of time wasted trying to programatically set a selection, found no answer so passed the range directly
 * QUnit
 * - setup possible when declaring module and actually should be used not to repeat too much test
 * - split test in different files
 * TYPE
 * - lots of type errors, functions called with wrong parameters, or expecting wrong output type
 *   because the signature of the function was forgotten, or forgetting to return the output value
 *   in closure for example
 * ON.THE.FLY coding
 * - wrong scope - function thought to be defined module scope but hidden into another function
 * - wrong arguments passed o function, or in wrong order, or missing arguments
 *   because one forgot the EXACT signature and behaviour of the function
 */

define(['jquery', 'data_struct', 'url_load', 'utils', 'socket', 'cache', 'Stateful'],
       function ( $, DS, UL, UT, SOCK, CACHE, STATE ) {

          // module object
          var RM = {}; // Added so I can trace all member functions more easily

          //State objects
          var stateMap = {rpc_socket : undefined, aNotes : undefined};

          var CLASS_SELECTOR_CHAR = ".";
          var ID_SELECTOR_CHAR = "#";

          // CONFIG - cache mechanism
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

          // CONFIG - highlighting : put in config file somewhere which can be read by both server and client
          const StartSel = "<span class = 'highlight'>";
          const StartSel_nospaces = StartSel.replace(/ /g, "_");
          const StopSel = "</span>";
          const StopSel_nospaces = StopSel.replace(/ /g, "_");

          ////////// Database query functions
          RM.srv_qry_word_translation = function srv_qry_word_translation ( word, callback ) {
             //logEntry("srv_qry_word_translation");
             stateMap.rpc_socket.emit('get_translation_info', word, callback);
             //logExit("srv_qry_word_translation");
          };

          RM.srv_qry_important_words = function srv_qry_important_words ( word, callback ) {
             /*
              Word: the word to question the server with
              callback: executed when the server has finished its processing
              */
             //logEntry("srv_qry_important_words");
             stateMap.rpc_socket.emit('highlight_important_words', word, callback);
             return $.Deferred();
             //logExit("srv_qry_important_words");
          };

          RM.highlight_words = UT.async_cached(RM.srv_qry_important_words, null); // no caching
          RM.cached_translation = UT.async_cached(RM.srv_qry_word_translation, qry_translation_cache);

          ////////// Text processing main functions
          RM.make_article_readable = function make_article_readable ( your_url ) {
             var dfr = $.Deferred(); // to handle async results

             // TEST CODE
             if (FAKE.should_be(RM.make_article_readable)) {
                return FAKE(RM.make_article_readable, this)(dfr, url_load_callback, your_url);
             }
             ///////
             /*return  $.get('http://www.corsproxy.com/www.voxeurop.eu/cs/content/editorial/4765047-jsme-zpet',
              function(response) {console.log("response:", response);
              document.body.innerHTML = response; });*/
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
                   window.html_text = html_text;
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
                      .done(function extract_relevant_text_from_html_success ( err, html_text ) {
                               logWrite(DBG.TAG.INFO, "page highlighted!");
                               //console.log("highlightd text: ", html_text);
                               dfr.resolve(null, html_text);
                            })
                      .fail(function extract_relevant_text_from_html_failure ( err, result ) {
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
          };

          RM.extract_relevant_text_from_html = function extract_relevant_text_from_html ( html_text ) {
             /*
              LIMITATION : Will not work for pages who have paragraph directly under body
              This case is currently considered pathological and ignored
              IMPROVEMENT : look if there is an article tag, in which case take the title and add it first with H1 tag before constructing the page
              */
             //logEntry("extract_relevant_text_from_html");
             var MIN_SENTENCE_NUMBER = 7;
             var MIN_AVG_AVG_SENTENCE_LENGTH = 10;
             var SOURCE = "source"; //for temporarily keep the loaded webpage
             var DEST = "destination";

             var $source = RM.create_div_in_DOM(SOURCE).html(html_text);
             $source.hide();
             $("head", $source).remove();
             $("iframe", $source).remove();
             $("script", $source).remove();
             $("style", $source).remove();
             $("header", $source).remove();

             $source.appendTo($("body")); //apparently it is necessary to add it to body to avoid having head and doctype etc tag added
             var $dest = RM.create_div_in_DOM(DEST);
             //$dest.appendTo($("body"));

             // A little bit of tag cleaning, not really necessary in fact

             logWrite(DBG.TAG.INFO, "Compute tag stats");
             var aData = RM.generateTagAnalysisData($source);
             //TEST OODE
             window.aData = aData;
             //
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
             //TEST OODE
             window.aDivRow = aDivRow;
             //

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
             // extract from selectedDivs only the divs
             var aSelectedDivSelectors = [];
             selectedDivs.forEach(function ( selectedDiv ) {
                aSelectedDivSelectors.push(selectedDiv.div);
             });

             var dfr = $.Deferred();
             var prm_success = RM.highlight_important_words(aData, aSelectedDivSelectors, $dest);
             prm_success
                .done(function highlight_important_words_success ( html_highlighted_text ) {
                         //following pattern function(err, result)
                         // if was successfully highlit then pass the $dest that was modified in place
                         logWrite(DBG.TAG.INFO, "done processing highlight_important_words");
                         logWrite(DBG.TAG.DEBUG, "dest", $dest.html().substring(0, 300));

                         dfr.resolve(null, html_highlighted_text);
                      })
                .fail(function highlight_important_words_failure ( error ) {
                         // this happens if one of the selectedDivs provokes an error
                         logWrite(DBG.TAG.WARNING, "error occurred while processing highlight_important_words");
                         dfr.reject(error, null);
                      });
             $source.remove();

             return dfr.promise();
          };

          /**
           @param {array} aData
           @returns {array}
           */
          RM.compute_text_stats_group_by_div = function compute_text_stats_group_by_div ( aData ) {
             var aDivRow = []; // contains stats for each div
             aData.forEach(function ( pdStatRow, index, array ) {
                var div = pdStatRow.enclosing_div;
                logWrite(DBG.TAG.DEBUG, "index, div, tagName", index, div, pdStatRow.tag);
                var iIndex = UT.getIndexInArray(aDivRow, "div", div);

                if (iIndex > -1) { // div class already added to the stat array
                   aDivRow[iIndex].sum_sentence_number += pdStatRow.sentence_number;
                   aDivRow[iIndex].sum_avg_sentence_length += pdStatRow.avg_sentence_length;
                   aDivRow[iIndex].count_avg_sentence_length += 1;
                }
                else { // first time seen that div class, so add it to the stat array
                   aDivRow.push({div : div, sum_sentence_number : pdStatRow.sentence_number, sum_avg_sentence_length : pdStatRow.avg_sentence_length, count_avg_sentence_length : 1});
                }
             });

             return aDivRow;
          };

          /**
           @param aDivRow {array} array of div elements from the page to analyze
           @returns {array} filtered array with only the div elements to keep for presentation, e.g. the important text
           */
          RM.select_div_to_keep =
          function select_div_to_keep ( aDivRow, MIN_SENTENCE_NUMBER, MIN_AVG_AVG_SENTENCE_LENGTH ) {
             var selectedDivs = [];
             var pdStatRowPartial, i;
             for (i = 0; i < aDivRow.length; i++) {
                pdStatRowPartial = aDivRow[i]; //ParagraphData object
                if (pdStatRowPartial.sum_sentence_number >= MIN_SENTENCE_NUMBER &&
                    pdStatRowPartial.avg_avg_sentence_length >= MIN_AVG_AVG_SENTENCE_LENGTH) {
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
          };

          /**
           *
           for each element of the array of selected div elements, highlight its text content
           then put the result in the destination DOM element
           The DOM takes the el from its source and (RE)MOVES it to the destination
           issue : might be necessary to have a special treatment for div with no classes AND no id selectors
           */
          RM.highlight_important_words = function highlight_important_words ( aData, aSelectedDivs, $dest ) {

             // for all selected Div, get the closest div from aData, move it to dest, parse dest

             // append each div to $dest
             var aTarget$el = [];
             aData.forEach(function ( paragraphData ) {
                const PREFIX = "z_";
                var pdEnclosingDiv = paragraphData.enclosing_div;
                if (aSelectedDivs.indexOf(pdEnclosingDiv) !== -1) {
                   // this div is selected, get the div
                   var closest_div = paragraphData.mapClosestDiv[PREFIX + pdEnclosingDiv];
                   // if not already selected for moving to destination, add it
                   if (aTarget$el.indexOf(closest_div) === -1) {
                      aTarget$el.push(closest_div);
                   }
                }
             });
             // move it to dest
             aTarget$el.forEach(function ( $el ) {
                $el.appendTo($dest);
             });

             // Add the class mapping for given html tags and attributes
             var mapTagClass = {};
             var mapAttrClass = {};

             mapTagClass["TITLE"] = 'title';
             mapAttrClass["class"] = {title : 'title'};

             // highlight $dest and return the promise
             return RM.highlight_text_in_div($dest, mapTagClass, mapAttrClass);
          };

          /**
           * Highlights important words found in $el
           * Does not change el, returns the highlighted text as an HTML string
           * through a promise
           * mapTagClass allows to add some class attribute to the DOM elements with a given tag
           * Here it is used to add a class for styling the title of the page
           * mapTagClass[tagName] = class_name
           * If we process a <title> then add class = 'title'
           * If we process a <tag class='title'> then add a class='title' i.e. keep it
           */
          RM.highlight_text_in_div = function highlight_text_in_div ( $el, mapTagClass, mapAttrClass ) {

             //TODO : add the filter for notes here too before the highlight words so it applies first
             // However, it needs to works also on aHTMLTokens with more than one word per text token
             // move RC.filter_selected_word to RM module, attention signature differs, we need the aNotes state object
             // and rewrite it so it works without the one word per token thing
             // that means I will have to apply the filter to the word and put it back directly with action:identity
             // e.g. apply the action internally at word level. action:identity necessary so the second action is ignored
             // and rename filter_selected_word to xxx_words
             return $.when(
                RM.apply_highlighting_filters_to_text(
                   $el,
                   RM.fn_parser_and_transform(mapTagClass, mapAttrClass),
                   [RM.filter_selected_words, RM.highlight_words]));
          };

          /**
           * Highlights words which has been marked as notes by the user
           * @param aHTMLtokens
           * @param aNotes {Array} Optional parameter. Used to pass a custom notes object
           * @returns {aTokenActionMap}
           */
          RM.filter_selected_words = function filter_selected_words ( aHTMLtokens, aNotes ) {
             // Reminder : aHTMLtokens :: {type : 'html_begin_tag', text : xx, word_number: xx, name : xx}
             // Reminder aNotes :: (word, index)
             // if called with custom-made notes object, use that, otherwise use the stored one.
             aNotes = (aNotes && UT.isArray(aNotes)) ? aNotes : RM.get_notes();
             console.log("aNotes", aNotes);
             // edge case: no notes -> return the action map with null (no action);
             if (aNotes.length === 0) {
                return aHTMLtokens.map(function ( html_token ) {return {token : html_token, action : null}});
             }

             // main case : sort note word index by ascending order so we can retrieve them in that order
             aNotes.sort(function sort_notes ( a, b ) {
                return a.index - b.index;
             });

             var aIndexes = aNotes.map(function ( note ) {return note.index});
             var currentNoteIndex = aIndexes.shift(),
                curr_word_count = 0,
                next_word_count = 0,
                aTokenActionMap = [];
             // 2. Scan through aHTMLTokens and for each text, count the words in it
             //    If it fits the next index then split it further and perform the transformation on the word at index
             //    Put an action (identity) in from of that word as tokenActionMap, so it is performed with priority

             aHTMLtokens.forEach(
                function ( html_token ) {
                   switch (html_token.type) {
                      case 'html_begin_tag':
                      case 'html_end_tag':
                         aTokenActionMap.push({token : html_token, action : null});
                         break;

                      case 'text':
                         // Basically, split into words. Apply the filter iff : real word && in a position found in note
                         // For that, get a list of the note indexes that will be reached while iterating over the words
                         // of 'text'. Then iterate over the words of the text, when reaching note indexes, apply filter
                         var aRelevantIndexes = []; // relevant word indexes from the note for that text
                         next_word_count = curr_word_count + html_token.word_number;
                         // if we are scanning a text within within which word number X is, and word number is X is a note
                         while (currentNoteIndex && (curr_word_count < currentNoteIndex) &&
                                (currentNoteIndex <= next_word_count)) {
                            // then keep all those indexes
                            aRelevantIndexes.push(currentNoteIndex);
                            currentNoteIndex = aIndexes.shift();
                         }
                         var currSelectedIndex = aRelevantIndexes.shift();
                         html_token.text.split(" ").forEach(function ( word ) {
                            if (word === "") {
                               aTokenActionMap.push({token : {type : 'text', text : ' ', word_number : 0}, action : null});
                            }
                            else {
                               curr_word_count++;
                               if (currSelectedIndex && curr_word_count === currSelectedIndex) {
                                  // We are processing word X which is also in the notes, apply the highlighting filter
                                  aTokenActionMap.push({token    : RM.fn_html_highlight_note(word),
                                                          action : UT.identity});
                                  // move on to the next word in notes
                                  currSelectedIndex = aRelevantIndexes.shift();
                               }
                               else {
                                  // else apply nothing
                                  aTokenActionMap.push(
                                     {token : {type : 'text', text : word, word_number : undefined}, action : null});
                               }
                            }
                         });
                         break;
                      default:
                         break;
                   }
                }
             );
             return aTokenActionMap;
          };

          /**
           * Purpose : filter function to highlight (via html) a word within an [html_token] structure
           * @param html_token
           * @returns {{type: string, text: string}} Returns an html_token structure
           */
          RM.fn_html_highlight_note = function fn_html_highlight_note ( word ) {
             return {
                type        : 'text',
                text        : "<span class='airlang-rdt-note-highlight'>" + word + "</span>",
                word_number : undefined
             };
          };

          /**
           INPUT:
           @param $source {jquery element} the id of the div source within which to select the text
           @returns {array} returns an array with text stats in ParagraphData object (div class, sentence number etc.)
           */
          RM.generateTagAnalysisData = function generateTagAnalysisData ( $source ) {
             DBG.LOG_INPUT_VALUE('$source', $source);

             /* We only analyze the paragraph as:
              - they are a better indication of the content of the article
              - tables tend to have short phrases, e.g. can mislead the analysis based on average length of sentences
              - same goes for span tags, who tend not to have complete sentences
              */
             var tagHTML = "p",
             // array which will contain the analysis of text paragraphs
                aData = [];

             /*
              For each paragraph, calculate a series of indicators
              - number of sentences
              - average length of sentences in words
              - number of links
              - the first enclosing div
              */
             logWrite(DBG.TAG.DEBUG, "Computing stats on text with tags", tagHTML);
             $(tagHTML, $source).each(get_tag_stat);

             //logExit("generateTagAnalysisData");
             DBG.LOG_RETURN_VALUE(aData);
             return aData;

             /**
              * This function gets executed for each paragraph of the loaded html_page (located in $source)
              * @param index : index in the array of jQuery array-like object
              * @param element : the DOM <p> element
              */
             function get_tag_stat ( index, element ) {
                // this is just to ensure that the javascript native map do not interact badly with reserved names
                const PREFIX = "z_";
                var paragraghData = new DS.ParagraphData(),
                   $el = $(this); // In principle, same as $(element)

                switch (element.nodeType) {
                   // we only are dealing with paragraphs here, so that will always be the case
                   // but we keep like this for later possible evolution
                   // for example, case of old web pages who do not use the paragraph tags but direct text and
                   // page break with br tag
                   case 1: //Represents an element
                      var tagName = element.tagName;

                      var parentTagName = element.parentNode.tagName;
                      //var parentTagName = $(this).parent()[0].tagName;

                      // this portion of code ensure that value in tables do no count towards the stats
                      // if they would, table elements with one number would dramatically lower the average of words
                      // per sentence, hence a greater likelihood of excluding paragraphs
                      // So in short, no paragraph whose parent has a table tag will be accounted for
                      // This means paragraphs in table cells are discounted
                      //var isTableContent =  ? "false" : "true";
                      if (parentTagName.search("T") !== -1) {
                         // that include TR, TD, TH, hopefully nothing else relevant
                         break;
                      }

                      //TODO : replace by jQUERY closest
                      var hierarchy = $el.parentsUntil("body", "div") || [$("body")]; //!! to test! if no div enclosing, then body is used
                      var div = $(hierarchy[0]); // By construction can't be null right?
                      var div_id = div.attr("id");
                      var div_class = div.attr("class");

                      paragraghData.$el = $el;
                      paragraghData.tag = tagName;
                      paragraghData.text = element.textContent.trim();
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

                      paragraghData.enclosing_div_id = (typeof div_id === "undefined") ? "" : div_id;
                      paragraghData.enclosing_div_class = (typeof div_class === "undefined") ? "" : div_class;
                      paragraghData.enclosing_div =
                      RM.get_DOM_select_format_from_class(paragraghData.enclosing_div_id,
                                                          paragraghData.enclosing_div_class);//we have to take care of the case with several classes
                      paragraghData.mapClosestDiv = {};
                      paragraghData.mapClosestDiv[PREFIX + paragraghData.enclosing_div] = div;

                      aData.push(paragraghData);
                      break;

                   case 3: //Represents textual content in an element or attribute
                      // that case should never happen because of the processing done prior to the call (wrap in span tags)
                      // for the sake of completeness we could define it though
                      logWrite(DBG.TAG.WARNING, "text", element);
                      break;

                   default:
                      //do nothing
                      logWrite(DBG.TAG.WARNING, "do nothing");
                }
             }
          };

          ////////// Text processing helper functions
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

          ////////// Filter helper functions

          RM.simple_tokenizer = function simple_tokenizer ( text ) {
             /**
              * Tokenizer :   text => [token] (word array)
              */
             var aTokens = text.split(" ");
             aTokens.type = 'token';
             return aTokens;
          };

          RM.simple_detokenizer = function simple_detokenizer ( aTokens ) {
             return aTokens.join(" ");
          };

          RM.fn_html_highlight = function fn_html_highlight ( html_token ) {
             return {type : 'text', text : [StartSel, html_token.text, StopSel].join("")}
          };

          RM.dataAdapterOStore2TokenActionMap =
          function dataAdapterOStore2TokenActionMap ( OStore, aHTMLTokens ) {

             /////// Helper function
             function push_token_action ( word ) {
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
                   aTokenActionMap.push({token : {type : 'text', text : word}, action : RM.fn_html_highlight});
                   mark = false;
                }
                else if (mark === true) {
                   logWrite(DBG.TAG.DEBUG, "associating action highlight to word ", word);
                   aTokenActionMap.push({token : {type : 'text', text : word}, action : RM.fn_html_highlight});
                }
                else {
                   //logWrite(DBG.TAG.DEBUG, "associating action none to word ", word);
                   aTokenActionMap.push({token : {type : 'text', text : word}, action : null});
                }
             }

             ////

             logWrite(DBG.TAG.DEBUG, "highlit_text", highlit_text);
             // TODO: to synchronize better with server instead of copying : move to common config file??
             var highlit_text = OStore.toString(); // the query returns with a OStore object
             highlit_text = highlit_text.replace(new RegExp(StartSel, "g"), StartSel_nospaces);
             highlit_text = highlit_text.replace(new RegExp(StopSel, "g"), StopSel_nospaces);
             // For StopSel not necessary as there is no spaces
             // This manipulation ensures that whatever the StartSel, I will have the beginning and end
             // delimited by StartSel and StopSel without adding any space-delimited word
             var aTokenActionMap = [];
             var mark = false;
             var word_token_index = 0;
             var aTokens = highlit_text.split(" ");
             // I have the token, now assigning actions
             aHTMLTokens.forEach(function ( html_token ) {
                switch (html_token.type) {
                   case 'html_begin_tag':
                   case 'html_end_tag':
                      aTokenActionMap.push({token : html_token, action : null});
                      break;
                   case 'text' :
                      //var aHighlightedWords = html_token.text.split(" ");
                      var length_text = html_token.text.split(" ").length;
                      for (var i = 0; i < length_text; i++, word_token_index++) {
                         push_token_action(aTokens[word_token_index]);
                      }
                      break;
                   default :
                      throw 'dataAdapterOStore2TokenActionMap: read token with unknown type ' + html_token.type;
                }
             });

             return aTokenActionMap;
          };

          RM.dataAdapterHTMLTok2Text = function dataAdapterHTMLTok2Text ( aHTMLtokens ) {
             return aHTMLtokens
                .filter(function ( html_token ) {
                           // filter out all html_tag, keep only the text
                           return html_token.type === 'text';
                        })
                .map(function ( html_token ) {
                        return html_token.text;
                     })
                // the space in the join is mandatory to separate text under different tags
                // otherwise we get sth like :
                //Jsme zpět | VoxEurop.eu: European news, cartoons and press reviewsKdyž končil
                //Note the reviews stuck to Když. Or <p>sth sth</p><p>sth that will be stuck</p>
                // This has other side effects but well, this is the lesser evil
                .join(" ");
          };

          RM.fn_parser_and_transform =
          function fn_parser_and_transform ( mapTagClass, mapAttrClass, /* boolean optional */ flag_no_transform ) {
             return function fn_parser ( $el ) {
                return UT.parseDOMtree($el, mapTagClass, mapAttrClass, flag_no_transform);
             }
          };

          RM.get_notes = function get_notes () {
             return stateMap.aNotes;
          };

          RM.set_notes = function set_notes ( aNotes ) {
             return stateMap.aNotes = aNotes;
          };

          ////////// Filter highlighting functions
          /**
           * Purpose    : highlight words in a text
           * Input      : text without formatting | array of highlighting filters
           * Output     : string representing the highlighted text
           * Assumption : - Filter function do not add or remove token, and do not change token order,
           *                i.e. modifies token in place or leave them intact
           *              - The text passed in parameter is already trimmed
           * @param $el {jQuery} character string to be highlighted
           * @param aFilters {array}  array of filter functions to be applied.
           *                          Filters' index in array is a decreasing function of priority of application.
           *                          i.e. aFilters[0] takes precedence over aFilters[1]
           *                          Filters have to be registered to know they input type and output type
           * Algorithm  : Transform a text into tokens, then apply filters to those tokens.
           *              Filters mark the token to be highlighted. When all filters are done, highlighting functions
           *                are applied by order of priority. The corresponding tokens are then converted back to text
           */
          RM.apply_highlighting_filters_to_text =
          function apply_highlighting_filters_to_text ( $el, fn_parser, aFilters ) {

             /*
              1. Read html from element and tokenize it (two tokens type, html_tag and text)
              Tokenizer :   JQuery => [html_parsed_token] - html_parsed_token :: {type: html_tag | text, text: string}
              */

             var dfr = $.Deferred();
             var aHTMLtokens = fn_parser($el).aHTMLtokens;
             aHTMLtokens.type = 'array_of_html_token';

             logWrite(DBG.TAG.DEBUG, "html tokens", UT.inspect(aHTMLtokens, null, 3));

             /*
              3. For each filter : apply filter to [html_parsed_token]
              */
             $.when.apply(undefined, RM.getTokenActionMap(aHTMLtokens, aFilters)).then(
                function getTokenActionMap_done ( /*arguments is each of the token_action_map type returned by filters*/ ) {
                   // Note : the when function concatenate resolution of deferred in the same order than they were called
                   // e.g. in the same order than the array of filters
                   var aFilterResults = Array.prototype.slice.call(arguments);

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
                         // if action_a is falsy (null or undefined or ""), then reduce to action_b
                         return action_a ? action_a : action_b;
                      })
                   });
                   logWriteShort(DBG.TAG.DEBUG, "aTransposedResults - action reduce"
                      , aTransposedResults
                   );

                   // Apply filter selected
                   // [{token, action_final}]  =>  [token_filtered]
                   var aTokensActedOn = aTransposedResults.map(function ( transposedResult ) {
                      return (transposedResult.action ?
                              transposedResult.action.call(null, transposedResult.token) :
                              transposedResult.token);
                   });
                   //logWrite(DBG.TAG.DEBUG, "aTokensActedOn", UT.inspect(aTokensActedOn, null, 4));

                   /*
                    * 6. [html_parsed_token] -> html_text
                    */
                   var final_output = aTokensActedOn
                      .map(function ( html_parsed_token ) {
                              return html_parsed_token.text.trim();
                           })
                      .join(" ");

                   logWrite(DBG.TAG.DEBUG, "final_output",
                            UT.inspect(final_output, null, 4));

                   dfr.resolve(final_output);
                });

             return dfr.promise();
          };

          /** [filter], [token]  =>  [ [{token, action}]_token ]_filter
           *                             i_adapter    filter       o_adapter
           * This works like this : token -> input_type -> output_type -> [ [{token, action}]_token ]_filter
           * aFilters: array of REGISTERED filters. If the filter is not registered, fields will be missing and it will not work!!
           */
          RM.getTokenActionMap = function getTokenActionMap ( aTokens, aFilters ) {
             var aPromises = [];

             aFilters.forEach(
                function ( filter, index, array ) {
                   logWrite(DBG.TAG.DEBUG, "analysis of token by filter", UT.inspect(filter, null, 2));
                   if (!filter.input_type || !filter.output_type) {
                      throw 'getTokenActionMap: type information not available. Possible cause is filter was not registered. Check filter ' +
                            filter.name
                   }

                   var i_adapter = DS.filter_get_data_adapter(aTokens.type, filter.input_type);
                   var o_adapter = DS.filter_get_data_adapter(filter.output_type, 'token_action_map');
                   logWrite(DBG.TAG.DEBUG, "executing filter ", filter.filter_name, "with tokens", i_adapter(aTokens));

                   var deferred_or_value =
                      DS.promise_value_adapter(
                         filter.call(null, i_adapter(aTokens), result_callback),
                         result_callback);

                   function result_callback ( err, result ) {
                      // if the filter is not asynchronous, it must not expect nor use a second argument
                      // is asynchronous, it must have a second argument
                      if (err) {
                         logWrite(DBG.TAG.ERROR,
                                  "getTokenActionMap: error returned by filter ", filter.filter_name, err);
                         deferred_or_value.reject(["error in highlight words", err].join(" : "));
                      }
                      else {
                         logWrite(DBG.TAG.DEBUG, "executing output adapter", o_adapter.name || o_adapter.displayName);
                         // Note: we pass the tokens as a second optional parameter in case the output adapter needs
                         // that contextual info. Ideally, the adapter should only need the output of the filter
                         // as input
                         var aMapTokenAction = o_adapter(result, aTokens);

                         // the return here si important for the case where deferred_or_value is a value
                         return deferred_or_value.resolve(aMapTokenAction);
                      }
                   }

                   aPromises.push(deferred_or_value.promise());
                   // filter returns either a plain object or a promise/deferred. In any case that is stored
                });
             return aPromises;
          };

          ///////////// Notes handling function
          RM.add_notes = function add_notes ( field_value_map ) {
             // send order through state sockets
             return STATE.insert_stored_stateful_object('Notes_Collection', field_value_map);
          };

          RM.get_stored_notes = function get_stored_notes ( criteria ) {
             var self = this;
             // Get state info
             // return a promise that will be resolved when all state data has been retrieved
             return STATE.get_stored_stateful_object(
                'Notes_Collection',
                criteria)
                .then(function success ( aNotes ) {
                         //check type
                         if (!UT.isArray(aNotes)) {
                            return UT.log_error("get_stored_stateful_object:",
                                                "result for querying state object Notes_Collection : expected array, returned type",
                                                typeof aNotes);
                         }
                         else {
                            logWrite(DBG.TAG.DEBUG, "stateMap", UT.inspect(aNotes));
                            return RM.set_notes(aNotes);
                         }
                      },
                      function failure ( err ) {
                         return UT.log_error("get_stored_stateful_object:",
                                             "error querying state object Notes_Collection :", UT.inspect(err));
                      })
          };

          ////////// Module initialization
          // mostly contains initialization of filters and data adapters for text highlighting
          RM.init = function init () {
             //TODO : later create a version supporting several instances
             // 1. create function factory RM create new model instance
             // 2. put the statemap in that instance
             // 3. bind that instance to RM so this will mean RM
             // 4. everywhere in RC controller change RM by model
             // 5. init returns a model instance to main and main pass it to the controller
             // NOTE : Can construct can be used to that purpose
             stateMap.rpc_socket = SOCK.get_socket();

             DS.filter_register('text', 'async_cached_postgres_highlighted_text', RM.highlight_words);
             DS.filter_register('array_of_html_token', 'token_action_map', RM.filter_selected_words,
                                'filter_selected_word');

             DS.filter_register_data_adapters('array_of_html_token', 'text', RM.dataAdapterHTMLTok2Text);
             DS.filter_register_data_adapters('async_cached_postgres_highlighted_text', 'token_action_map',
                                              RM.dataAdapterOStore2TokenActionMap);
          };

          return RM;
       })
;
