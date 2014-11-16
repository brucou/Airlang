/**
 * Created by bcouriol on 11/05/14.
 * TODO : add language support
 * - word count depends heavily on punctuation sign and rules which are language-dependent
 * For example in czech, 1.6.2014 is not three sentence but one date
 * - get_text_stats : same
 * - for each new language support added, all these function should be tested against that language
 */
function get_text_stats(text) {
   /**
    @param text (string) The string text can be in several lines. Any HTML tags or else will be considered as normal text
    @returns an object with two fields:
    1. sentence_number
    2. avg_sentence_length

    LIMIT CASES : text="" -> {1,0}
    */
   logEntry("get_text_stats");
   if (!text) {
      logWrite(DBG.TAG.ERROR, "invalid parameter text: null or undefined", text);
      logExit("get_text_stats");
   }

   // split by . which is not of the kind number followed by a . ->
   // count the number of split
   // for each split, count the number of words
   var words = text.toLowerCase().replace(/[,;.!\?]/g, '').trim().split(/[\s\/]+/g);
   var word_number = (words[0].trim().length === 0) ? 0 : words.length; // case "" e.g. text with spaces and punct only
   var sentence_number = text.replace("...",".").split(".").length - 1;
   // naive algorithm for english, just count number of dots. But we should also count !? as end of sentences
   // even for english could be improved with .+space (\n or " " etc or EOF)
   // also, we take 1 as sentence number even if there is no ., it could be a sentence not terminated by a . like in a li element
   // but if there is a . somewhere then . are expected everywhere
   if (sentence_number === 0) {//if there is no DOT in the text, we still count one sentence
      sentence_number = 1;
   }
   //logWrite(DBG.TAG.INFO, "Input & Output", text, sentence_number, word_number);
   //logExit("get_text_stats");
   logExit("get_text_stats");
   return {sentence_number: sentence_number, avg_sentence_length: Math.round(word_number / sentence_number)};
}

function clean_text(sWords) {
   /*
    @param sWords {string} the string to be clean
    returns removes extra spaces and new lines by a single space. Also remove trailing and leading spaces
    */
   return sWords.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
}

function wrap (text, wrap_char) { return [wrap_char, text, wrap_char].join(""); }

function count_words (text) {
   return text.match(/\S+/g).length ;
}
