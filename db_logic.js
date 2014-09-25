/**
 * Created by bcouriol on 15/09/14.
 */

/**
 * Use deferred because pgClient stuff can only be done aftre pgClient is non null
 * @type {exports}
 */

var LOG = require('./debug');
var
   pg = require('pg'),
   pgClient = null, // database connection variables
   // list of requent words as returned by query - set here as a default in case the query does not work or for testing purposes
   important_words = 'a | aby | agentura | akce | akcie | aktivita | ale | alespoň | americký | ani | ano | armáda | asi | auto | autor | avšak | ať | až | banka | barva | bez | bezpečný | blízký | bod | boj | branka | britský | brzy | bránit | brát | budoucnost | budova | byt | bát | během | běžný | bílý | březen | bůh | být | bývalý | bývat | celek | celkem | celkový | celý | cena | centrum | cesta | chodit | chtít | chvíle | chyba | chápat | co | což | cíl | cítit | daleko | další | datum | daň | demokracie | demokratický | den | deset | desítka | divadlo | divák | dlouho | dlouhý | dnes | dnešní | do | doba | dobrý | dodat | dohoda | dojít | dokonce | dokument | dokázat | dolar | doma | domnívat | domácí | domů | dopis | doprava | dopravní | dosavadní | dost | dostat | dostávat | dosud | dosáhnout | druh | druhý | družstvo | držet | dráha | duben | duch | dva | dvacet | dveře | dále | dát | dávat | dějiny | dělat | díky | dílo | dítě | dívat | dívka | důležitý | dům | důsledek | důvod | ekonomický | ekonomika | energie | evropský | existovat | film | filmový | finance | finanční | firma | fond | forma | fotbalový | foto | fotografie | francouzský | františek | funkce | galerie | generální | gól | historický | historie | hlas | hlava | hlavně | hlavní | hledat | hledisko | hned | hod | hodina | hodlat | hodnota | hodně | hora | hospodářský | host | hotel | hovořit | hra | hranice | hrát | hráč | hudba | hudební | i | informace | informovat | instituce | investice | investiční | jak | jako | jaký | jakýkoli | jakýsi | jasný | jazyk | jeden | jediný | jednat | jednoduchý | jednotka | jednotlivý | jednou | jednání | jeho | jejich | její | jen | jenom | jenž | jestli | jestliže | jet | jezdit | ještě | jinak | jiný | jistě | jistý | již | jmenovat | jméno | já | jít | k | kam | kancelář | kategorie | každý | kde | kdo | kdy | kdyby | když | kino | klub | kniha | kolem | kolik | kolo | komise | konat | koncert | konec | konečně | konečný | konference | konkrétní | kontakt | kontrola | koruna | koupit | krok | kromě | krásný | krátký | který | kultura | kulturní | kurs | kvalita | květen | kvůli | leden | les | letos | letošní | ležet | li | lidový | lidský | liga | list | listopad | ln | loňský | lze | láska | látka | lékař | léto | majetek | majitel | malý | materiál | matka | metoda | metr | mezi | mezinárodní | miliarda | milión | mimo | ministerstvo | ministr | minulý | minuta | mistr | mistrovství | mladý | mluvit | mluvčí | mnohem | mnoho | mnohý | množství | moc | moci | model | moderní | možná | možný | muset | muzeum | muž | mužstvo | my | myslet | myšlenka | málo | měnit | město | městský | měsíc | míra | místní | místo | mít | můj | na | nabídka | nabídnout | nabízet | nad | naděje | najít | nakonec | naopak | napsat | např | například | nato | navíc | ne | nebo | neboť | nechat | neděle | nejen | nemocnice | než | nic | nikdo | nikdy | nikoli | noc | noha | novinář | nový | nutný | nyní | náklad | náměstí | národ | národní | návrh | návštěva | název | názor | náš | něco | nějaký | někdo | někdy | několik | některý | německý | nízký | o | oba | obchod | obchodní | období | obec | objekt | objevit | oblast | obor | obrana | obraz | obrovský | obsahovat | obyvatel | občan | občanský | oběť | ochrana | od | odborník | odborný | odejít | odmítnout | odpovědět | odpověď | odpovídat | okamžik | okno | oko | okolí | okresní | on | onen | oni | opatření | opravdu | opět | organizace | orgán | osm | osoba | osobní | ostatní | osud | otec | otevřený | otevřít | otázka | ovšem | označit | oznámit | očekávat | pacient | pak | pan | paní | papír | parlament | partner | patřit | peníze | pes | platit | plný | plocha | plyn | plán | po | pocit | pod | podat | podařit | podle | podmínka | podnik | podnikatel | podoba | podobný | podpora | podstata | podíl | podívat | pohled | pohyb | pohybovat | pojišťovna | pokoj | pokračovat | pokud | pokus | pole | policie | policista | politický | politik | politika | polovina | pomoc | pomoci | pondělí | poprvé | poslanec | poslední | postavit | postup | potom | potvrdit | poté | potřeba | potřebný | potřebovat | pouhý | pouze | použít | používat | považovat | pozdě | pozice | poznat | požadavek | počet | počátek | počítat | počítač | pořád | pracovat | pracovní | pracovník | pravda | pravidlo | pravý | pražský | premiér | prezident | privatizace | pro | problém | procento | proces | prodat | prodej | program | prohlásit | projekt | projev | prosinec | prostor | prostě | prostředek | prostředí | proti | proto | protože | provoz | proč | první | práce | právní | právo | právě | průběh | průmysl | prý | psát | pán | pár | pátek | péče | pět | přece | před | především | předmět | předpokládat | předseda | představa | představit | představitel | představovat | přes | přesto | přestože | přesvědčit | při | přicházet | přijet | přijmout | přijít | přinést | připravit | připravovat | přitom | přát | příběh | příjem | příklad | příležitost | příliš | přímo | přímý | případ | příprava | příroda | přístup | přítel | příští | příčina | půda | půl | působit | původní | rada | radnice | republika | režim | rodina | rodič | rok | role | rovněž | rozdíl | rozhodnout | rozhodnutí | rozhovor | rozpočet | rozvoj | ročník | ruka | ruský | rychlý | rád | rámec | ráno | růst | různý | s | schopný | scéna | sdružení | sdělit | se | sedm | sedět | sem | seriál | setkání | sice | silný | situace | skončit | skoro | skupina | skutečný | sledovat | sloužit | slovenský | slovo | služba | slyšet | smlouva | smrt | smysl | směr | smět | snad | snaha | snažit | sněmovna | snímek | snížit | sobota | sociální | soubor | soud | souhlasit | soukromý | soupeř | soutěž | současný | součást | sovětský | spojený | společný | spolu | spolupráce | spor | sportovní | správa | správný | spíš | srdce | srpen | stanice | starosta | starý | stav | stavba | stavební | stačit | stejně | stejný | sto | století | strana | stroj | struktura | stránka | student | studium | stát | státní | střední | stůl | svaz | svoboda | svět | světlo | světový | svůj | syn | systém | sám | síla | síť | tady | tak | takový | taky | takže | také | tam | technický | technika | tedy | tehdy | tel | televize | televizní | ten | tenhle | tento | teprve | termín | text | teď | tiskový | tisíc | titul | tlak | tolik | totiž | trenér | trh | trochu | trvat | tu | turnaj | tvorba | tvořit | tvrdit | tvář | ty | typ | tzv | téma | téměř | tělo | těžký | třeba | třetí | tři | třída | týden | týkat | tým | u | událost | udělat | ukázat | ulice | umožňovat | umělecký | umění | umět | unie | univerzita | určit | určitý | uskutečnit | utkání | uvedený | uvádět | uvést | uzavřít | už | v | vedení | vedle | vedoucí | velice | velký | velmi | veškerý | večer | veřejný | vhodný | vidět | vlastně | vlastní | vliv | vloni | vláda | vládní | vnitřní | voda | vojenský | voják | volba | volební | volný | vracet | vrátit | vstoupit | vstup | vy | vybrat | vycházet | vydat | vyhrát | vyjádřit | vyjít | vypadat | vysoký | vysvětlit | vytvořit | využít | vzduch | vzhledem | vzniknout | vztah | vzít | však | všechen | vždy | vždycky | vždyť | válka | váš | včera | včetně | vést | věc | vědět | věk | věnovat | většina | většinou | věřit | více | vítězství | vůbec | vůz | vůči | výbor | výběr | východní | výkon | výrazný | výroba | výrobce | výrobek | výsledek | výstava | výstavba | vývoj | význam | významný | výše | z | za | zabývat | zahraniční | zahraničí | zahájit | zajistit | zajímavý | zaměstnanec | zaplatit | zase | zastavit | zatím | zatímco | začátek | začínat | začít | zařízení | zboží | zbraň | zcela | zda | zde | zdravotní | zdroj | zdát | zejména | země | zeptat | zhruba | zisk | zjistit | zlatý | změna | změnit | znamenat | značný | znovu | známý | znát | zpráva | způsob | způsobit | ztratit | ztráta | zvláštní | zvýšení | zvýšit | zájem | zákazník | základ | základní | zákon | záležitost | západní | zápas | zároveň | zástupce | závislý | závod | závěr | září | získat | zůstat | zůstávat | Široký | Škoda | Škola | Špatný | Život | Žádný | šance | šest | široký | škoda | škola | špatný | šéf | že | žena | život | životní | žádný | žít | ČR | ČSSD | Čechy | Černý | Červenec | Červený | Český | Čistý | Částka | Řada | čas | časopis | často | čekat | čelo | černý | červen | červenec | červený | český | či | čin | činit | čistý | člen | člověk | článek | čtyři | část | částka | číslo | číst | řada | ředitel | řešení | řešit | řád | říci | říjen | říkat | řízení | údaj | úkol | únor | úprava | úroveň | úspěch | úspěšný | ústav | útok | úvěr | území | účast | účastník | úřad';

const conString = "postgres://postgres:Italska184a@localhost/postgres"; // connection string

process.env.DATABASE_URL = process.env.DATABASE_URL || conString;

function initialize_database () {
   console.log("database URL", process.env.DATABASE_URL);

   pg.connect(process.env.DATABASE_URL, function (err, client) {
      if (err) {
         console.error('could not connect to postgres', err);
         return null;
      }
      pgClient = client;
      console.log('successfully got a database client from which to do queries');
      exec_qry_freq_word_list(); // that updates important_words
   });
}

function close_connection () {
   pgClient.end();
}

function exec_qry_freq_word_list () {
   pgClient.query("select string_agg(word, ' | ') as freq_words from pgWordFrequency where freq_cat = 'A';",
                  function (err, result) {
                     if (err) {
                        console.error('error running query', err);
                        return null;
                     }
                     important_words = result.rows[0].freq_words;
                     //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
                  });
}

function get_db_client () {
   return pgClient;
}

function get_important_words () {
   return important_words;
}

module.exports = {
   initialize_database: initialize_database,
   close_connection   : close_connection,
   get_important_words: get_important_words,
   get_db_client      : get_db_client
};
