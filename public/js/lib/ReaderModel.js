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
 * - when a click is made on a word previously selected to be memorized, take the word out of the database
 *   ask for confirmation??

 * nice to have : treat wikipedia as a special case. More special cases? http://en.wikipedia.org/wiki/Perranzabuloe
 * TODO : BUGS
 * TODO : enlever toutes les promises jquery et utiliser RSVP partout
 * issue : treat the case of text in div with no class or id (http://www.praha3.cz/noviny/akce-mestske-casti/vinohradske-vinobrani-nabidne-produkty.html)
 * issue : analyse why some paragraphs are not parsed : http://prazsky.denik.cz/zpravy_region/lenka-mrazova-dokonalost-je-moje-hodnota-20140627.html
 * issue : better support for language-dependant punctuation signs and idiosyncrasy (... vs . etc.)
 */

define(['debug', 'jquery', 'rsvp', 'data_struct', 'url_load', 'utils', 'socket', 'cache', 'Stateful'],
       function ( DBG, $, RSVP, DS, UL, UT, SOCK, CACHE, STATE ) {

         // logger
         var log = DBG.getLogger("RM");

         // module object
         var RM = {}; // Added so I can trace all member functions more easily
         RM.config = {
           TSR_WORD_CONTEXT_SENTENCE   : 15,
           cache                       : {
             qry_translation_CACHE_SIZE : 500, //max 500 keys (frequent words) for this cache
             qry_translation_CACHE_LOG  : true,
             qry_cache_options          : {
               expirationAbsolute : null,
               expirationSliding  : 60 * 1500,
               priority           : Cache.Priority.HIGH,
               callback           : function ( k, v ) {
                 //console.log('key removed from cache :' + k);
               }}
           },
           MIN_SENTENCE_NUMBER         : 7,
           MIN_AVG_AVG_SENTENCE_LENGTH : 11,
           highlight                   : {
             // CONFIG - highlighting : put in config file somewhere which can be read by both server and client
             StartSel : "<span class = 'highlight'>",
             StopSel  : "</span>"
           }
         };
         RM.config.highlight.StartSel_nospaces = RM.config.highlight.StartSel.replace(/ /g, "_");
         RM.config.highlight.StopSel_nospaces = RM.config.highlight.StopSel.replace(/ /g, "_");

         //State objects
         var stateMap = {aNotes : undefined};

         var CLASS_SELECTOR_CHAR = ".";
         var ID_SELECTOR_CHAR = "#";

         var localCache = new Cache.LocalStorageCacheStorage('qry_translation_cache');

         var qry_translation_cache = new Cache(
           RM.config.cache.qry_translation_CACHE_SIZE,
           RM.config.cache.qry_translation_CACHE_LOG,
           localCache,
           RM.config.cache.qry_cache_options
         );

         ////////// Database query functions
         RM.srv_qry_word_translation = function srv_qry_word_translation ( word, callback ) {
           log.sock("get_translation_info", "emitting", word);
           SOCK.emit('get_translation_info', word, callback);
         };

         RM.srv_qry_important_words = function srv_qry_important_words ( word, callback ) {
           /*
            Word: the word to question the server with
            callback: executed when the server has finished its processing
            */
           //logEntry("srv_qry_important_words");
           log.sock("highlight_important_words", "emitting", word);
           SOCK.emit('highlight_important_words', word, callback);
           return $.Deferred();
           //logExit("srv_qry_important_words");
         };

         RM.highlight_words = RM.srv_qry_important_words; // no caching
         RM.cached_translation = UT.async_cached(RM.srv_qry_word_translation, qry_translation_cache);

         ////////// Text processing main functions
         RM.make_article_readable = function make_article_readable ( your_url, aNotes ) {
           var dfr = $.Deferred(); // to handle async results

           /*return  $.get('http://www.corsproxy.com/www.voxeurop.eu/cs/content/editorial/4765047-jsme-zpet',
            function(response) {console.log("response:", response);
            document.body.innerHTML = response; });*/
           UL.url_load(encodeURI(your_url))
             .then(
             function extract_relevant_text_from_html ( html_text ) {
               return RM.extract_relevant_text_from_html(html_text, aNotes);
             },
             function url_load_error ( jqXHR, textStatus, errorThrown ) {
               log.error("error encountered while fetching url");
               dfr.reject(new DS.Error("<p> ERROR : could not retrieve the webpage : " + errorThrown +
                                       "</p>"));
             })
             .then(function extract_text_from_html_success ( html_highlighted_text ) {
                     log.info("page highlighted!");
                     dfr.resolve(html_highlighted_text);
                   },
                   function extract_text_from_html_failure ( ds_error ) {
                     dfr.reject(ds_error);
                   });

           return dfr.promise();
         };

         RM.extract_relevant_text_from_html =
         function extract_relevant_text_from_html ( html_text, aNotes ) {
           /*
            LIMITATION : Will not work for pages who have paragraph directly under body
            This case is currently considered pathological and ignored
            IMPROVEMENT : look if there is an article tag, in which case take the title and add it first with H1 tag before constructing the page
            */
           var dfr = $.Deferred(),
             MIN_SENTENCE_NUMBER = RM.config.MIN_SENTENCE_NUMBER,
             MIN_AVG_AVG_SENTENCE_LENGTH = RM.config.MIN_AVG_AVG_SENTENCE_LENGTH,
             SOURCE = "source", //for temporarily keep the loaded webpage
             DEST = "destination";

           if (!html_text) {
             log.warning("empty page!! nothing to display");
             return dfr.reject(new DS.Error("<p> ERROR : nothing to display </p>" +
                                            "<p> Possible causes : empty page loaded! </p>"));
           }

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

           log.info("Compute tag stats");
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
           log.info("Compute tag stats grouped by div");
           var aDivRow = RM.compute_text_stats_group_by_div(aData);
           //TEST OODE
           window.aDivRow = aDivRow;
           //

           /* we finished exploring, now gather the final stats (averages)
            */
           log.info("We finished exploring, now gather the final stats (averages)");
           var i;
           for (i = 0; i < aDivRow.length; i++) {
             aDivRow[i].avg_avg_sentence_length =
             aDivRow[i].sum_avg_sentence_length / aDivRow[i].count_avg_sentence_length;
           }

           /* Identify the div classes to keep in the DOM */
           log.info("Identify the div classes to keep in the DOM");
           var selectedDivs = RM.select_div_to_keep(aDivRow, MIN_SENTENCE_NUMBER, MIN_AVG_AVG_SENTENCE_LENGTH);
           if (selectedDivs.length === 0) {
             log.warning("no div selected!! nothing to display");
             return dfr.reject(new DS.Error("<p> ERROR : nothing to display </p>" +
                                            "<p> Possible cause : no important paragraph could be identified </p>"));
           }

           log.info("Reading and adding title");
           RM.read_and_add_title_to_$el($source, $dest);

           log.info("Highlighting important words");
           // extract from selectedDivs only the divs
           var aSelectedDivSelectors = selectedDivs.map(function ( selectedDiv ) {
             return selectedDiv.div;
           });

           RM.highlight_important_words(aData, aSelectedDivSelectors, $dest, aNotes)
             .done(function highlight_important_words_success ( html_highlighted_text ) {
                     //following pattern function(err, result)
                     // if was successfully highlit then pass the $dest that was modified in place
                     log.info("done processing highlight_important_words");
                     log.debug("dest", $dest.html().substring(0, 300));

                     dfr.resolve(html_highlighted_text);
                   })
             .fail(function highlight_important_words_failure ( error ) {
                     // this happens if one of the selectedDivs provokes an error
                     log.warning("error occurred while processing highlight_important_words");
                     dfr.reject(new DS.Error("<p> " + error + "</p>"));
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
             log.debug("index, div, tagName", index, div, pdStatRow.tag);
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
               log.info("keeping div class, sentence_number, avg w/s", pdStatRowPartial.div,
                        pdStatRowPartial.sum_sentence_number, pdStatRowPartial.avg_avg_sentence_length);
             }
             else {
               log.info("discarding div class, sentence_number, avg w/s", pdStatRowPartial.div,
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
         RM.highlight_important_words = function highlight_important_words ( aData, aSelectedDivs, $dest, aNotes ) {

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
           return RM.highlight_text_in_div($dest, mapTagClass, mapAttrClass, aNotes);
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
         RM.highlight_text_in_div = function highlight_text_in_div ( $el, mapTagClass, mapAttrClass, aNotes ) {
           function filter_selected_words ( aNotes ) {
             log.debug("aNotes", aNotes)
             var fn = function filter_selected_words ( aHTMLtokens ) {
               return RM.filter_selected_words(aHTMLtokens, aNotes)
             };
             fn.input_type = RM.filter_selected_words.input_type;
             fn.output_type = RM.filter_selected_words.output_type;
             fn.filter_name = RM.filter_selected_words.filter_name;
             return fn;
           }

           return RM.apply_highlighting_filters_to_text($el, RM.fn_parser_and_transform(mapTagClass, mapAttrClass),
                                                        [filter_selected_words(aNotes), RM.highlight_words]);
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
           //aNotes = (aNotes && UT.isArray(aNotes)) ? aNotes : RM.get_notes();
           log.debug("aNotes.length passed", aNotes.length);
           if (!aNotes || !UT.isArray(aNotes)) {
             aNotes = RM.notes.data;
           }
           log.debug("aNotes.length now", aNotes.length);
           // main case : sort note word index by ascending order so we can retrieve them in that order
           aNotes.sort(function sort_notes ( a, b ) {
             return a.index - b.index;
           });

           var aIndexes = aNotes.map(function ( note ) {
             return note.index
           });
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
                         aTokenActionMap.push({token   : RM.fn_html_highlight_note(word),
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
          * Purpose : filter function to highlight (via html) a word
          * @param word {string}
          * @returns {{type: string, text: string, word_number: undefined}} Returns an html_token structure
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
          @param $source {jQuery} the id of the div source within which to select the text
          @returns {array} returns an array with text stats in ParagraphData object (div class, sentence number etc.)
          */
         RM.generateTagAnalysisData = function generateTagAnalysisData ( $source ) {
           log.debug('$source', $source);

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
           log.debug("Computing stats on text with tags", tagHTML);
           $(tagHTML, $source).each(get_tag_stat);

           //logExit("generateTagAnalysisData");
           log.debug("returning aData : ", aData);
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
                   log.warning("text in element is empty : ignoring");
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
                 log.warning("text", element);
                 break;

               default:
                 //do nothing
                 log.warning("do nothing");
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
           log.debug("title", $("title", $source).text());
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
             log.warning("html_text_to_DOM: already existing id. Was emptied", div_id);
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
           return {type : 'text', text : [RM.config.highlight.StartSel, html_token.text, RM.config.highlight.StopSel].join("")}
         };

         RM.dataAdapterOStore2TokenActionMap =
         function dataAdapterOStore2TokenActionMap ( OStore, aHTMLTokens ) {
           // NOTE this is usable also with strings as Ostore is only used as OStore.toString()
           /////// Helper function
           function push_token_action ( word ) {
             if (word.indexOf(RM.config.highlight.StartSel_nospaces) == 0) {
               // beginning of marking
               //log.debug("found begin of marking");
               word = word.replace(new RegExp(RM.config.highlight.StartSel_nospaces, "g"), "");
               //log.debug("word after removal of startsel marking: ", word);
               mark = true;
             }
             if (mark == true && word.indexOf(RM.config.highlight.StopSel_nospaces) > 0) {
               word = word.replace(new RegExp(RM.config.highlight.StopSel_nospaces, "g"), "");
               //log.debug("associating action highlight to word ", word);
               aTokenActionMap.push({token : {type : 'text', text : word}, action : RM.fn_html_highlight});
               mark = false;
             }
             else if (mark === true) {
               //log.debug("associating action highlight to word ", word);
               aTokenActionMap.push({token : {type : 'text', text : word}, action : RM.fn_html_highlight});
             }
             else {
               //log.debug("associating action none to word ", word);
               aTokenActionMap.push({token : {type : 'text', text : word}, action : null});
             }
           }

           ////

           var highlit_text = OStore.toString(); // the query returns with a OStore object
           log.debug("highlit_text", highlit_text);
           // TODO: to synchronize better with server instead of copying : move to common config file??
           highlit_text =
           highlit_text.replace(new RegExp(RM.config.highlight.StartSel, "g"), RM.config.highlight.StartSel_nospaces);
           highlit_text =
           highlit_text.replace(new RegExp(RM.config.highlight.StopSel, "g"), RM.config.highlight.StopSel_nospaces);
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

         ////////// Filter highlighting functions
         /**
          * Purpose    : highlight words in a text
          * Input      : text without formatting | array of highlighting filters
          * Output     : string representing the highlighted text
          * Assumption : - Filter function do not add or remove token, and do not change token order,
          *                i.e. modifies token in place or leave them intact
          *              - The text passed in parameter is already trimmed
          * @param $el {jQuery} character string to be highlighted
          * @param fn_parser {Function} Parsing function who turn html_text into parsed_html
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
           var aHTMLtokens = fn_parser($el).aHTMLtokens, parsed = aHTMLtokens;
           aHTMLtokens.type = 'array_of_html_token';

           log.debug("html tokens", UT.inspect(aHTMLtokens, null, 3));

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
               //log.debug("aTokensActedOn", UT.inspect(aTokensActedOn, null, 4));

               /*
                * 6. [html_parsed_token] -> html_text
                */
               var final_output = aTokensActedOn
                 .map(function ( html_parsed_token ) {
                        return html_parsed_token.text.trim();
                      })
                 .join(" ");

               log.debug("final_output",
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
           //TEST CODE
           token = aTokens;
           ///////

           aFilters.forEach(
             function ( filter, index, array ) {
               log.debug("analysis of token by filter", UT.inspect(filter, null, 2));
               if (!filter.input_type || !filter.output_type) {
                 throw 'getTokenActionMap: type information not available. Possible cause is filter was not registered. Check filter ' +
                       filter.filter_name
               }

               var i_adapter = DS.filter_get_data_adapter(aTokens.type, filter.input_type);
               var o_adapter = DS.filter_get_data_adapter(filter.output_type, 'token_action_map');
               log.debug("executing filter ", filter.filter_name, "with tokens");
               log.debug(i_adapter(aTokens));

               var deferred_or_value = filter.call(null, i_adapter(aTokens), result_callback);

               function result_callback ( err, result ) {
                 // if the filter is not asynchronous, it must not expect nor use a second argument
                 // is asynchronous, it must have a second argument
                 if (err) {
                   log.error(
                     "getTokenActionMap: error returned by filter ", filter.filter_name, err);
                   deferred_or_value.reject(["error in highlight words", err].join(" : "));
                 }
                 else {
                   log.debug("executing output adapter", o_adapter.name || o_adapter.displayName);
                   // Note: we pass the tokens as a second optional parameter in case the output adapter needs
                   // that contextual info. Ideally, the adapter should only need the output of the filter
                   // as input
                   var aMapTokenAction = o_adapter(result, aTokens);

                   // the return here si important for the case where deferred_or_value is a value
                   return deferred_or_value.resolve(aMapTokenAction);
                 }
               }

               aPromises.push(deferred_or_value);
               // filter returns either a plain object or a promise/deferred. In any case that is stored
             });
           return aPromises;
         };

         ///////////// Notes handling function
         RM.add_notes = function add_notes ( key_exists, fields_remainder ) {
           /*return SOCK.RSVP_emit('add_note', {
            action   : 'insert if not exists',
            entity   : 'Notes',
            criteria : key_exists,
            values   : UT._extend(key_exists, fields_remainder)});*/
           return STATE.insert_if_ne_stored_stateful_object('Notes',
                                                            {  criteria : key_exists,
                                                              values    : UT._extend(key_exists, fields_remainder)});
         };

         RM.add_TSR_weight = function add_TSR_weight ( obj ) {
           // Example obj :: {user_id : self.stateMap.user_id, word : note.word}
           return new RSVP.Promise(function ( resolve, reject ) {
             log.sock("set_TSR_word_weights", "emitting", obj);
             SOCK.emit('set_TSR_word_weights', obj,
                       UT.default_node_callback(resolve, reject));
           });
         };

         /**
          * Makes and returns a note object containing:
          * - the word
          * - the word index (non-empty words i.e. spaces do not count)
          * - the DOM element from which the text was obtained
          * - a few words surrounding the word selected
          * @param full_text {String}
          * @param final_index {Number}
          * @param rootNode {Element}
          * @returns {{word: *, index: *, rootNode: *, context_sentence: *}}
          */
         RM.get_note_from_param = function get_note_from_param ( full_text, final_index, rootNode ) {
           full_text = UT.remove_extra_spaces(full_text);
           var note = {
             word     : RM.simple_tokenizer(full_text).filter(UT.is_word)[final_index - 1],
             index    : final_index,
             rootNode : rootNode
           };

           var word_index = 0;
           var real_index = 0;
           var aWords = RM.simple_tokenizer(full_text);
           aWords.some(function ( word, index ) {
             word_index = word_index + (word ? 1 : 0);
             real_index = index;
             return final_index === word_index;
           });
           // Note: the edge cases (word not found) are not considered as we get here after already finding the word
           note.context_sentence = aWords.slice(Math.max(real_index - TSR_WORD_CONTEXT_SENTENCE, 0),
                                                real_index + TSR_WORD_CONTEXT_SENTENCE).join(" ");
           return note;
         };

         ////////// Data store
         RM.notes = {
           // TODO : add notes, etc
           /**
            * Retrieve the remotely stored notes corresponding to some criteria (similar to SQL WHERE clause)
            * @param criteria {Object} Object containing the query fields of the notes collection whose corresponding
            *                          data is to be retrieved
            * @returns {RSVP.Promise} returns a promise that will be resolved when all state data has been retrieved
            */
           fetch     : function fetch_notes ( criteria ) {
             // Get state info
             // return a promise that will be resolved when all state data has been retrieved
             return new RSVP.Promise(function ( resolve, reject ) {
               STATE.get_stored_stateful_object('Notes', {criteria : criteria})
                 .then(function success ( aNotes ) {
                         //check type
                         if (!UT.isArray(aNotes)) {
                           log.error("get_stored_stateful_object:",
                                     "result for querying state object Notes : expected array, returned type",
                                     typeof aNotes);
                           reject("result for querying state object Notes : expected array, returned type");
                         }
                         else {
                           log.debug("Notes fetched:", UT.inspect(aNotes));
                           //                            return RM.notes.set_notes(aNotes);
                           resolve(RM.notes.data = aNotes);
                         }
                       },
                       function failure ( err ) {
                         return log.error("get_stored_stateful_object:",
                                          "error querying state object Notes :", UT.inspect(err));
                         reject("error querying state object Notes");
                       });
             })
           },
           add_notes : function add_notes ( key_exists, fields_remainder ) {
             /*return SOCK.RSVP_emit('add_note', {
              action   : 'insert if not exists',
              entity   : 'Notes',
              criteria : key_exists,
              values   : UT._extend(key_exists, fields_remainder)});*/
             return STATE.insert_if_ne_stored_stateful_object('Notes',
                                                              {  criteria : key_exists,
                                                                values    : UT._extend(key_exists, fields_remainder)});
           },

           add_TSR_weight : function add_TSR_weight ( obj ) {
             // Example obj :: {user_id : self.stateMap.user_id, word : note.word}
             return new RSVP.Promise(function ( resolve, reject ) {
               log.sock("set_TSR_word_weights", "emitting", obj);
               SOCK.emit('set_TSR_word_weights', obj,
                         UT.default_node_callback(resolve, reject));
             });
           }
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
