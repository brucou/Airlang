/**
 * Created by bcouriol on 5/07/14.
 */
setConfig(DBG.TAG.DEBUG, true, {by_default: true}); // default is don't show debug messages
disableLog(DBG.TAG.DEBUG, "CachedValues.init");
disableLog(DBG.TAG.DEBUG, "putValueInCache");
disableLog(DBG.TAG.DEBUG, "disaggregate_input");
disableLog(DBG.TAG.DEBUG, "async_cached_f");
enableLog(DBG.TAG.DEBUG, "propagateResult");


function do_sth_w_cb(word, callback) {
   setTimeout(function () {
      return callback.apply(null, [false, {data: add_prefix(word)}]); // calls the callback function with arguments, nice trick
   }, Math.random() * 10); //allows to test when callbacks return in random sequences
   logWrite(DBG.TAG.DEBUG, "called with word", word, "now", timeStamp());
}

function add_prefix(word) {
   return ["->", word].join("");
}

var highlightFrequentWords = do_sth_w_cb;


//var osStore; // to change to be able to view osStore from the command line

//done: correct the some -> function some bug
//highlight_text($("body"), "P, DIV", new )
// done : strip the /n and the , and the . and the ! : from the words
// why does it nor work with LI but only with P tags?

/*
 var cCache = [];
 cCache.push({key : 'magistrats', value: 'PREFIX!magistrats'});
 var cvCache = new CachedValues(cCache);
 */
