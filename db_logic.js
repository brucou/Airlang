/**
 * Created by bcouriol on 15/09/14.
 */

/**
 * TODO: instead of copying utils, reuse the one from client side U=require(.../.. etc/utils)
 * @type {exports}
 */

var LOG = require('./debug'),
   U = require('./public/js/lib/utils'), // load the client side utils
   Util = require('util'), // load the node server side util
   RSVP = require('rsvp');

const conString = "postgres://postgres:Italska184a@localhost/postgres"; // connection string
process.env.DATABASE_URL = process.env.DATABASE_URL || conString;

var pg = require('pg'),
   pgClient = null, // database connection variables
   pgAdapter = 'pg',
// list of frequent words as returned by query - set here as a default in case the query does not work or for testing purposes
   important_words = {},
   stop_words = {};

important_words['cs'] =
'a | aby | agentura | akce | akcie | aktivita | ale | alespoň | americký | ani | ano | armáda | asi | auto | autor | avšak | ať | až | banka | barva | bez | bezpečný | blízký | bod | boj | branka | britský | brzy | bránit | brát | budoucnost | budova | byt | bát | během | běžný | bílý | březen | bůh | být | bývalý | bývat | celek | celkem | celkový | celý | cena | centrum | cesta | chodit | chtít | chvíle | chyba | chápat | co | což | cíl | cítit | daleko | další | datum | daň | demokracie | demokratický | den | deset | desítka | divadlo | divák | dlouho | dlouhý | dnes | dnešní | do | doba | dobrý | dodat | dohoda | dojít | dokonce | dokument | dokázat | dolar | doma | domnívat | domácí | domů | dopis | doprava | dopravní | dosavadní | dost | dostat | dostávat | dosud | dosáhnout | druh | druhý | družstvo | držet | dráha | duben | duch | dva | dvacet | dveře | dále | dát | dávat | dějiny | dělat | díky | dílo | dítě | dívat | dívka | důležitý | dům | důsledek | důvod | ekonomický | ekonomika | energie | evropský | existovat | film | filmový | finance | finanční | firma | fond | forma | fotbalový | foto | fotografie | francouzský | františek | funkce | galerie | generální | gól | historický | historie | hlas | hlava | hlavně | hlavní | hledat | hledisko | hned | hod | hodina | hodlat | hodnota | hodně | hora | hospodářský | host | hotel | hovořit | hra | hranice | hrát | hráč | hudba | hudební | i | informace | informovat | instituce | investice | investiční | jak | jako | jaký | jakýkoli | jakýsi | jasný | jazyk | jeden | jediný | jednat | jednoduchý | jednotka | jednotlivý | jednou | jednání | jeho | jejich | její | jen | jenom | jenž | jestli | jestliže | jet | jezdit | ještě | jinak | jiný | jistě | jistý | již | jmenovat | jméno | já | jít | k | kam | kancelář | kategorie | každý | kde | kdo | kdy | kdyby | když | kino | klub | kniha | kolem | kolik | kolo | komise | konat | koncert | konec | konečně | konečný | konference | konkrétní | kontakt | kontrola | koruna | koupit | krok | kromě | krásný | krátký | který | kultura | kulturní | kurs | kvalita | květen | kvůli | leden | les | letos | letošní | ležet | li | lidový | lidský | liga | list | listopad | ln | loňský | lze | láska | látka | lékař | léto | majetek | majitel | malý | materiál | matka | metoda | metr | mezi | mezinárodní | miliarda | milión | mimo | ministerstvo | ministr | minulý | minuta | mistr | mistrovství | mladý | mluvit | mluvčí | mnohem | mnoho | mnohý | množství | moc | moci | model | moderní | možná | možný | muset | muzeum | muž | mužstvo | my | myslet | myšlenka | málo | měnit | město | městský | měsíc | míra | místní | místo | mít | můj | na | nabídka | nabídnout | nabízet | nad | naděje | najít | nakonec | naopak | napsat | např | například | nato | navíc | ne | nebo | neboť | nechat | neděle | nejen | nemocnice | než | nic | nikdo | nikdy | nikoli | noc | noha | novinář | nový | nutný | nyní | náklad | náměstí | národ | národní | návrh | návštěva | název | názor | náš | něco | nějaký | někdo | někdy | několik | některý | německý | nízký | o | oba | obchod | obchodní | období | obec | objekt | objevit | oblast | obor | obrana | obraz | obrovský | obsahovat | obyvatel | občan | občanský | oběť | ochrana | od | odborník | odborný | odejít | odmítnout | odpovědět | odpověď | odpovídat | okamžik | okno | oko | okolí | okresní | on | onen | oni | opatření | opravdu | opět | organizace | orgán | osm | osoba | osobní | ostatní | osud | otec | otevřený | otevřít | otázka | ovšem | označit | oznámit | očekávat | pacient | pak | pan | paní | papír | parlament | partner | patřit | peníze | pes | platit | plný | plocha | plyn | plán | po | pocit | pod | podat | podařit | podle | podmínka | podnik | podnikatel | podoba | podobný | podpora | podstata | podíl | podívat | pohled | pohyb | pohybovat | pojišťovna | pokoj | pokračovat | pokud | pokus | pole | policie | policista | politický | politik | politika | polovina | pomoc | pomoci | pondělí | poprvé | poslanec | poslední | postavit | postup | potom | potvrdit | poté | potřeba | potřebný | potřebovat | pouhý | pouze | použít | používat | považovat | pozdě | pozice | poznat | požadavek | počet | počátek | počítat | počítač | pořád | pracovat | pracovní | pracovník | pravda | pravidlo | pravý | pražský | premiér | prezident | privatizace | pro | problém | procento | proces | prodat | prodej | program | prohlásit | projekt | projev | prosinec | prostor | prostě | prostředek | prostředí | proti | proto | protože | provoz | proč | první | práce | právní | právo | právě | průběh | průmysl | prý | psát | pán | pár | pátek | péče | pět | přece | před | především | předmět | předpokládat | předseda | představa | představit | představitel | představovat | přes | přesto | přestože | přesvědčit | při | přicházet | přijet | přijmout | přijít | přinést | připravit | připravovat | přitom | přát | příběh | příjem | příklad | příležitost | příliš | přímo | přímý | případ | příprava | příroda | přístup | přítel | příští | příčina | půda | půl | působit | původní | rada | radnice | republika | režim | rodina | rodič | rok | role | rovněž | rozdíl | rozhodnout | rozhodnutí | rozhovor | rozpočet | rozvoj | ročník | ruka | ruský | rychlý | rád | rámec | ráno | růst | různý | s | schopný | scéna | sdružení | sdělit | se | sedm | sedět | sem | seriál | setkání | sice | silný | situace | skončit | skoro | skupina | skutečný | sledovat | sloužit | slovenský | slovo | služba | slyšet | smlouva | smrt | smysl | směr | smět | snad | snaha | snažit | sněmovna | snímek | snížit | sobota | sociální | soubor | soud | souhlasit | soukromý | soupeř | soutěž | současný | součást | sovětský | spojený | společný | spolu | spolupráce | spor | sportovní | správa | správný | spíš | srdce | srpen | stanice | starosta | starý | stav | stavba | stavební | stačit | stejně | stejný | sto | století | strana | stroj | struktura | stránka | student | studium | stát | státní | střední | stůl | svaz | svoboda | svět | světlo | světový | svůj | syn | systém | sám | síla | síť | tady | tak | takový | taky | takže | také | tam | technický | technika | tedy | tehdy | tel | televize | televizní | ten | tenhle | tento | teprve | termín | text | teď | tiskový | tisíc | titul | tlak | tolik | totiž | trenér | trh | trochu | trvat | tu | turnaj | tvorba | tvořit | tvrdit | tvář | ty | typ | tzv | téma | téměř | tělo | těžký | třeba | třetí | tři | třída | týden | týkat | tým | u | událost | udělat | ukázat | ulice | umožňovat | umělecký | umění | umět | unie | univerzita | určit | určitý | uskutečnit | utkání | uvedený | uvádět | uvést | uzavřít | už | v | vedení | vedle | vedoucí | velice | velký | velmi | veškerý | večer | veřejný | vhodný | vidět | vlastně | vlastní | vliv | vloni | vláda | vládní | vnitřní | voda | vojenský | voják | volba | volební | volný | vracet | vrátit | vstoupit | vstup | vy | vybrat | vycházet | vydat | vyhrát | vyjádřit | vyjít | vypadat | vysoký | vysvětlit | vytvořit | využít | vzduch | vzhledem | vzniknout | vztah | vzít | však | všechen | vždy | vždycky | vždyť | válka | váš | včera | včetně | vést | věc | vědět | věk | věnovat | většina | většinou | věřit | více | vítězství | vůbec | vůz | vůči | výbor | výběr | východní | výkon | výrazný | výroba | výrobce | výrobek | výsledek | výstava | výstavba | vývoj | význam | významný | výše | z | za | zabývat | zahraniční | zahraničí | zahájit | zajistit | zajímavý | zaměstnanec | zaplatit | zase | zastavit | zatím | zatímco | začátek | začínat | začít | zařízení | zboží | zbraň | zcela | zda | zde | zdravotní | zdroj | zdát | zejména | země | zeptat | zhruba | zisk | zjistit | zlatý | změna | změnit | znamenat | značný | znovu | známý | znát | zpráva | způsob | způsobit | ztratit | ztráta | zvláštní | zvýšení | zvýšit | zájem | zákazník | základ | základní | zákon | záležitost | západní | zápas | zároveň | zástupce | závislý | závod | závěr | září | získat | zůstat | zůstávat | Široký | Škoda | Škola | Špatný | Život | Žádný | šance | šest | široký | škoda | škola | špatný | šéf | že | žena | život | životní | žádný | žít | ČR | ČSSD | Čechy | Černý | Červenec | Červený | Český | Čistý | Částka | Řada | čas | časopis | často | čekat | čelo | černý | červen | červenec | červený | český | či | čin | činit | čistý | člen | člověk | článek | čtyři | část | částka | číslo | číst | řada | ředitel | řešení | řešit | řád | říci | říjen | říkat | řízení | údaj | úkol | únor | úprava | úroveň | úspěch | úspěšný | ústav | útok | úvěr | území | účast | účastník | úřad';
stop_words['cs'] =
[   'a', 'ale', 'ano', 'atd', 'by', 'být', 'co', 'čí', 'čím', 'do', 'i', 'já', 'jak', 'je', 'jeho', 'jemu', 'její',
    'jejich', 'ji', 'jí', 'jim', 'již', 'jsem', 'jsi', 'jsou', 'k', 'kde', 'kdo', 'kdy', 'který', 'mě', 'mém', 'mne',
    'mně', 'můj', 'my', 'na', 'nad', 'nám', 'náš', 'ne', 'o', 'on', 'ona', 'oni', 'ono', 'pak', 'po', 'pod', 'pro',
    'proto', 'proč', 'před', 's', 'se', 'sem', 'si', 'svůj', 'ta', 'tady', 'tak', 'také', 'tam', 'tato', 'teď', 'ten',
    'ti', 'tím', 'to', 'tobě', 'tomu', 'tvůj', 'ty', 'tyto', 'u', 'už', 'v', 've', 'vám', 'váš', 'viz', 'vy', 'z', 'za',
    'ze', 'že'
   //, 'Člověku', 'se', 'kvůli', 'tomu', '<', 'inserted', 'comment', 'že', 'přestane', 'kouřit', 'zpomalí'
];

var registry_adapters = {},
   PG = 'pg';

function init () {
   // Initialize database connection
   var promise = init_pg_cnx();

   // Register queries
   const queryGetTranslationInfo = "SELECT DISTINCT " +
                                   " pglemmatranslationcz.translation_lemma, " +
                                   " pglemmatranslationcz.translation_sense, " +
                                   " pglemmaen.lemma_gram_info, " +
                                   " pglemmaen.lemma, " +
                                   " pglemmaen.sense, " +
                                   " pglemmatranslationcz.translation_gram_info, " +
                                   " pgsamplesentenceencz.example_sentence_from, " +
                                   " pgsamplesentenceencz.example_sentence_to, " +
                                   " pgwordfrequency_short.freq_cat" +
                                   " FROM pglemmaen" +
                                   " INNER JOIN pglemmatranslationcz " +
                                   " ON (pglemmatranslationcz.lemma_sense_id = pglemmaen.lemma_sense_id) " +
                                   " LEFT JOIN pgsamplesentenceencz " +
                                   " ON (pglemmatranslationcz.lemma_sense_id = pgsamplesentenceencz.lemma_sense_id)" +
                                   " INNER JOIN pgwordfrequency_short" +
                                   " ON (pglemmatranslationcz.translation_lemma = pgwordfrequency_short.lemma)" +
                                   " WHERE LOWER(pglemmatranslationcz.translation_lemma) in " +
                                   "     (select unnest(string_to_array(right(left(ts_lexize($1, $2)::varchar, -1), -1), ',')))";
   const qryHighlightImportantWords = "select ts_headline('cs', $1, to_tsquery('cs', $2), " +
                                      "'StartSel=\"<span class = ''highlight''>\", StopSel=\"</span>\", HighlightAll=true') " +
                                      "as highlit_text"; //important the first %s has no quotes

   pg_register_query('queryGetTranslationInfo', queryGetTranslationInfo, 2, ['cspell', 'default text']);
   pg_register_query('queryHighlightImportantWords', qryHighlightImportantWords, 2, ['cspell', 'default text']);

   register_db_adapter('sio_on_REST', {database : PG, table : 'pg_notepad'});

   return promise;
}

///////// Helper functions
function init_pg_cnx () {
   LOG.write(LOG.TAG.DEBUG, "database URL", process.env.DATABASE_URL);

   var promise = new RSVP.Promise(function ( resolve, reject ) {
      pg.connect(process.env.DATABASE_URL, function ( err, client ) {
         if (err) {
            console.error('could not connect to postgres', err);
            reject(err);
            return null;
         }
         pgClient = client;
         LOG.write(LOG.TAG.DEBUG, 'successfully got a database client from which to do queries');
         exec_qry_freq_word_list(); // that updates important_words
         resolve();
      });
   });
   return promise;
}

function close_connection () {
   pgClient.end();
}

function get_important_words () {
   return important_words;
}

function get_db_client () {
   return pgClient;
}

/**
 * Return a string with the partial query (param still to be applied) represent by the query_obj
 * @param query_obj {object} Object has the form {entity : entity, criteria : criteria}
 *                            where criteria represent the search criteria for the object to find
 *                            in the database
 * @return {string} returns partial query - to be completed with actual value of params
 */
function qry_make_sql_query ( query_obj, config ) {
   // query_obj :: {entity : entity, criteria : criteria}
   // NOTE : we do not include the parameters in the query here
   // We will use the escaping mechanism of the particular database in question for security reasons
   var qry_array = [],
      aArgs = [],
      wh_criteria,
      index;

   var action = query_obj.action;
   var table = config.table || query_obj.entity;
   switch (action) {
      case 'select':
         qry_array.push('select * from');
         qry_array.push(table);
         qry_array.push('where');
         wh_criteria = query_obj.criteria;
         index = 0;
         aArgs = [];
         for (var prop in wh_criteria) {
            if (wh_criteria.hasOwnProperty(prop)) {
               if (index > 0) {
                  qry_array.push("AND");
               }
               qry_array.push(prop);
               qry_array.push('=$' + (1 + index++));
               aArgs.push(wh_criteria[prop]);
            }
         }
         LOG.write(DBG.TAG.DEBUG, qry_array.join(" "), "with args", aArgs.join(" "));
         return {qry_string : qry_array.join(" "), aArgs : aArgs};
         break;
      case 'insert':
         // template :
         // INSERT INTO films (code, title, did, date_prod, kind)
         // VALUES ('T_601', 'Yojimbo', 106, DEFAULT, 'Drama');
         qry_array.push('INSERT INTO');
         qry_array.push(table);
         qry_array.push('(');
         aArgs = [];
         wh_criteria = query_obj.criteria;
         index = 0;
         var temp_array = [];
         for (var prop in wh_criteria) {
            if (wh_criteria.hasOwnProperty(prop)) {
               if (index > 0) {
                  qry_array.push(",");
                  temp_array.push(',');
               }
               qry_array.push(prop);
               temp_array.push('$' + (1 + index++));
               aArgs.push(wh_criteria[prop]);
            }
         }
         qry_array.push(')');
         qry_array.push('VALUES (');
         qry_array.push(temp_array.join(" "));
         qry_array.push(')');
         LOG.write(DBG.TAG.DEBUG, qry_array.join(" "), "with args", aArgs.join(" "));
         return {qry_string : qry_array.join(" "), aArgs : aArgs};

         break;
      default:
         break;
   }

}

///////

function exec_qry_freq_word_list () {
   pgClient.query("select string_agg(word, ' | ') as freq_words from pgWordFrequency where freq_cat = 'A';",
                  function ( err, result ) {
                     if (err) {
                        console.error('error running query', err);
                        return null;
                     }
                     important_words = result.rows[0].freq_words;
                     //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
                  });
}

function pg_register_query ( query_name, query_string, arg_number, aDefaultArgs ) {
   // Initializing registry
   var registry = pg_register_query.registry = pg_register_query.registry || {};

   // validation of inputs
   // number of arguments : 4, all args are mandatory
   var arity = arguments.length;
   const arity_expected = 4;
   if (arity != arity_expected) {
      throw 'pg_register_query: called with ' + arity + ' parameters instead of ' + arity_expected;
   }
   if (!query_name || typeof query_name != 'string') {
      throw 'pg_register_query: query_name must be non-empty string - found type ' + (typeof query_name) +
            'and value ' + query_name;
   }
   if (!query_string || typeof query_string != 'string') {
      throw 'pg_register_query: query_string must be non-empty string - found type ' + (typeof query_string) +
            'and value ' + query_string;
   }
   if (!arg_number || typeof arg_number != 'number') {
      throw 'pg_register_query: arg_number must be truthy number - found type ' + (typeof arg_number) +
            'and value ' + arg_number;
   }
   if (!aDefaultArgs && !Util.isArray(aDefaultArgs)) {
      throw 'pg_register_query: aDefaultArgs must be array - found type ' + (typeof aDefaultArgs) +
            'and value ' + aDefaultArgs;
   }

   // checking if already something registered with that name
   var query_obj = registry[query_name];
   if (query_obj) {
      // Here just warns, it could be in other cases to throw an exception
      LOG.write(DBG.TAG.WARNING, "Found another query with the same name - overwriting it!");
   }

   // copying default arguments
   query_obj = {};
   query_obj.query_string = query_string;
   query_obj.arg_number = arg_number;
   query_obj.aDefaultArgs = aDefaultArgs;
   registry[query_name] = query_obj;
}

/**
 *
 * @param {string} query_name The name of the query which must be previously registered.
 * @param {Array} aArgs
 * @returns {RSVP.Promise}
 */
function pg_exec_query ( query_name, aArgs ) {
   //TODO: use assert_type
   //cf. https://github.com/brianc/node-postgres/wiki/Client#method-query-parameterized

   // getting registry
   var registry = pg_register_query.registry;
   if (!registry) {
      throw 'pg_exec_query: falsy value for registry! Cannot execute query ' + query_name
   }

   // validation of inputs
   // number of arguments : 2, all args are mandatory
   var arity = arguments.length;
   const arity_expected = 2;
   if (arity != arity_expected) {
      throw 'pg_exec_query: called with ' + arity + ' parameters instead of ' + arity_expected;
   }
   if (!query_name || typeof query_name != 'string') {
      throw 'pg_exec_query: query_name must be non-empty string - found type ' + (typeof query_name) +
            'and value ' + query_name;
   }
   if (!aArgs && !Util.isArray(aArgs)) {
      throw 'pg_exec_query: aArgs must be array - found type ' + (typeof aArgs) +
            'and value ' + aArgs;
   }
   //recovering the registered query
   var query_obj = registry[query_name];
   if (!query_obj) {
      throw 'pg_exec_query: query_obj in registry must be truthy obj - found type ' + (typeof query_obj) +
            'and value ' + query_obj;
   }

   //recovering the SQL string associated to the query
   var query_string = query_obj.query_string;
   if (!query_string || typeof query_string != 'string') {
      throw 'pg_exec_query: query_string in query obj must be truthy obj - found type ' + (typeof query_string) +
            'and value ' + query_string;
   }

   // preparing the arguments for the query
   var arg_number = query_obj.arg_number;
   if (!arg_number || typeof arg_number != 'number') {
      throw 'pg_exec_query: arg_number must be truthy number - found type ' + (typeof arg_number) +
            'and value ' + arg_number;
   }
   var aDefaultArgs = query_obj.aDefaultArgs;
   if (!aDefaultArgs) {
      throw 'pg_register_query: aDefaultArgs must be truthy obj - found type ' + (typeof aDefaultArgs) +
            'and value ' + aDefaultArgs;
   }
   // replacing undefined arg in aArgs by values in default argument array
   aArgs.forEach(function ( arg, index, array ) {
      if (typeof arg === "undefined") {
         array[index] = aDefaultArgs[index];
      }
   });

   // transforming own properties in an array of arguments
   if (aArgs.length !== arg_number) {
      throw 'pg_exec_query: arguments number mismatch - expected ' + arg_number + ', received ' + aArgs.length
   }

   // getting the promise object
   var promise = new RSVP.Promise(function ( resolve, reject ) {
      // getting the pg client
      var pgClient = get_db_client(); // do something in case there is no client
      if (!pgClient) {
         console.log("no database client connection found");
         LOG.write(LOG.TAG.ERROR, 'no database client connection found');
         reject(Error('no database client connection found'));
      }

      pgClient.query(
         query_string, aArgs,
         function pg_exec_query_cb ( err, result ) {
            if (err) {
               LOG.write(LOG.TAG.ERROR, 'error running query ' + query_name, err);
               reject(Error(err));
               return;
            }
            if (result && result.rows) {
               //LOG.write(LOG.TAG.DEBUG, "query results", Util.inspect(result.rows));
               resolve(result);
            }
         });
      LOG.write(LOG.TAG.INFO, 'query sent to database server, waiting for callback');
   });

   return promise;
}

/**
 * Based on a configuration map, selects adapter to which database to return to handle queries on the object whose
 * identifier is passed as parameter
 * @param identifier {string} Links to config object in registry (config object has type :: {database: xx, table: xx}
 * @returns {{}}
 */
function get_db_adapter ( identifier ) {
   // TODO
   // get an initialized database object to perform query or create one if not available
   // that is another map where pg comes already initialized after app start-up (init function)

   var config = registry_adapters[identifier];
   if (!config) {
      throw "get_db_adapter: no database adapter registered for identifier " + identifier;
   }

   var exec_query = undefined;

   switch (config.database) {
      case PG:
         // Postgres
         // NOTE : the database client must have been initialized prior in the init function of the module
         var pgClient = get_db_client();
         exec_query = function ( query_obj ) {
            return new RSVP.Promise(function ( resolve, reject ) {
               var qry = qry_make_sql_query(query_obj, config);
               qry_string = qry.qry_string;
               aArgs = qry.aArgs;

               // execute the query and resolve the promise
               // NOTE : no exception throw, we use the promise mechanism instead
               pgClient.query(qry_string, aArgs,
                              function adapter_exec_query_cb ( err, result ) {
                                 if (err) {
                                    LOG.write(LOG.TAG.ERROR, 'while running query ', qry_string, qry_criteria,
                                              'error ocurred', err);
                                    reject(Error(err));
                                    return;
                                 }
                                 if (result) {
                                    LOG.write(LOG.TAG.DEBUG, 'db_adapter query returns', Util.inspect(result));
                                    resolve(result.rows);
                                 }
                              });
            });
         };

         break;
      default :
         throw "get_db_adapter: unknown adapter configured " + config;
   }

   return {
      // return results of a query or an error through promises
      exec_query : exec_query
   }
}

/**
 * Registry configuration facility associated to get_db_adapter
 *
 */
   //so far only Postgres adapter exists. Its identifier is 'pg' (cf var pgAdapter)
function register_db_adapter ( qry, config ) {
   // checking arguments
   U.assert_type(arguments, [
      {qry : U.type.string, config : null}
   ], {bool_no_exception : false});

   // checking if already something registered with that name
   var query_obj = registry_adapters[qry];
   if (query_obj) {
      // Here just warns, it could be in other cases to throw an exception
      LOG.write(DBG.TAG.WARNING, "Found another database adapter with the same name - overwriting it!");
   }

   registry_adapters [qry] = config;
}

module.exports = {
   initialize_database : init,
   close_connection    : close_connection,
   get_important_words : get_important_words,
   get_db_client       : get_db_client,
   pg_register_query   : pg_register_query,
   pg_exec_query       : pg_exec_query,
   get_db_adapter      : get_db_adapter
};
