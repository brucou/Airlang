-- some queries to remove ^$| erroneouly set from m-w extraction program
 -- first create a temp table for gathering the ^$| rows
 -- then update the database with the same string removing the |
drop table if exists temp;
select lemma_sense_id, substring(example_sentence_to from 2)
into temp
from pgsamplesentenceencz
where example_sentence_to like '|%';

-- checking results, check row count
select * from temp

-- perform the update
update pgsamplesentenceencz
set example_sentence_to = temp.substring
from temp
where temp.lemma_sense_id = pgsamplesentenceencz.lemma_sense_id

-- check if more rows to process (for instance rows that were ^$||) and repeat the process if necessary
select example_sentence_to
from pgsamplesentenceencz
where example_sentence_to like '|%'

--
-- Now the same thing to remove ||
--
drop table if exists temp;
select lemma_sense_id, replace(example_sentence_to, '||', '|')
into temp
from pgsamplesentenceencz
where example_sentence_to like '%||%';

select * from temp

update pgsamplesentenceencz
set example_sentence_to = temp.replace
from temp
where temp.lemma_sense_id = pgsamplesentenceencz.lemma_sense_id

select example_sentence_to
from pgsamplesentenceencz
where example_sentence_to like '%||%';

/*
* joining dictionary translation tables
*/
SELECT DISTINCT pglemmatranslationcz.translation_lemma,
pglemmatranslationcz.translation_sense,
pglemmaen.lemma_gram_info,
pglemmaen.lemma,
pglemmaen.sense,
pglemmatranslationcz.translation_gram_info,
pgsamplesentenceencz.example_sentence_from,
pgsamplesentenceencz.example_sentence_to,
pgwordfrequency_short.freq_cat
FROM pglemmaen
INNER JOIN pglemmatranslationcz ON (pglemmatranslationcz.lemma_sense_id = pglemmaen.lemma_sense_id)
LEFT JOIN pgsamplesentenceencz ON (pglemmatranslationcz.lemma_sense_id = pgsamplesentenceencz.lemma_sense_id)
INNER JOIN pgwordfrequency_short ON (pglemmatranslationcz.translation_lemma = pgwordfrequency_short.lemma)
WHERE LOWER (pglemmatranslationcz.translation_lemma) in
    (select unnest(string_to_array (RIGHT (LEFT (ts_lexize('cspell', 'dosavadní')::varchar, -1), -1), ',')))

ORDER BY
  pgwordfrequency_short.lemma ASC;
/*
* Some select to check lemmatization of postgres and word singled as being most frequent
*/
select * from pgWordFrequency where freq_cat = 'A' ;/* gives back 1000 words e.g. 500 roots aprox. */

select * from pgWordFrequency where frequency > 12000; /* gives back 1000 words e.g. 500 roots aprox. */
select to_tsquery('cs',string_agg(word, ' | ')) from pgWordFrequency where freq_cat = 'A'; /* gives back 1000 words e.g. 500 roots aprox. */
select string_agg(word, ' | ') from pgWordFrequency where freq_cat = 'A'; /* gives back 1000 words e.g. 500 roots aprox. */

select to_tsquery('cs', string_agg(word, " | ")) from pgWordFrequency where frequency > FREQ.LEVEL.I -> qFreqQuery
put result in query
select ts_headline('cs', text_sent_by_io , qFreqQuery),
'StartSel="<span class=''highlight''>",StopSel=</span>, HighlightAll=true');

-- check correspondence between lemma from postgres and lemma from excel file
select * from (SELECT right(left(ts_lexize('cspell','Moskva')::varchar,-1),-1) AS lexeme) AS TEMP LEFT JOIN pgwordfrequency_short  ON (lower(lemma) = TEMP.lexeme)
select * from pgwordfrequency_short where lemma like '%oskva'

-- how many lemma I have translated
SELECT DISTINCT
  pglemmatranslationcz.translation_lemma
FROM
  public.pglemmaen
  INNER JOIN public.pglemmatranslationcz ON (pglemmatranslationcz.lemma_sense_id = pglemmaen.lemma_sense_id)
  LEFT JOIN public.pgsamplesentenceencz ON (pglemmatranslationcz.lemma_sense_id = public.pgsamplesentenceencz.lemma_sense_id)
  INNER JOIN public.pgwordfrequency_short on (pglemmatranslationcz.translation_lemma = pgwordfrequency_short.lemma)

-- translation query put in stored proc
 --DROP FUNCTION translate(character varying);
 --DROP FUNCTION translate(text)
 -- PostgreSQL syntax
 DROP TYPE tf CASCADE;
 CREATE TYPE tf AS (--lemma_sense_id INTEGER,
                    translation_lemma VARCHAR, translation_sense VARCHAR,
                    lemma_gram_info VARCHAR, lemma VARCHAR, sense VARCHAR, translation_gram_info VARCHAR,
                    example_sentence_from VARCHAR, example_sentence_to VARCHAR, freq_cat character(2));

 CREATE OR REPLACE FUNCTION translate(in lemma varchar)
 RETURNS setof tf as $$
 SELECT DISTINCT
 --  pglemmaen.lemma_sense_id,
   pglemmatranslationcz.translation_lemma,
   pglemmatranslationcz.translation_sense,
   pglemmaen.lemma_gram_info,
   pglemmaen.lemma,
   pglemmaen.sense,
   pglemmatranslationcz.translation_gram_info,
   pgsamplesentenceencz.example_sentence_from,
   pgsamplesentenceencz.example_sentence_to,
   pgwordfrequency_short.freq_cat
 FROM pglemmaen
   INNER JOIN pglemmatranslationcz
     ON (pglemmatranslationcz.lemma_sense_id = pglemmaen.lemma_sense_id)
   LEFT JOIN pgsamplesentenceencz
     ON (pglemmatranslationcz.lemma_sense_id = pgsamplesentenceencz.lemma_sense_id)
   INNER JOIN pgwordfrequency_short
     ON (pglemmatranslationcz.translation_lemma = pgwordfrequency_short.lemma)
 WHERE LOWER(pglemmatranslationcz.translation_lemma) in
   (select unnest(string_to_array(right(left(ts_lexize('cspell', $1)::varchar, -1), -1), ',')))
 --ORDER BY pglemmaen.lemma_sense_id;
 --ORDER BY pgsamplesentenceencz.example_sentence_from, pglemmaen.lemma_sense_id;
 $$ language sql immutable strict;

-- Example : select * from translate('uvádět')

------------- everyday select and delete queries
select * from pg_notepad
select * from pg_tsr_word_weight
select * from pg_tsr_word_weight_hist
select * from pg_word_user_translation

delete from pg_notepad;
delete from pg_tsr_word_weight;
delete from pg_tsr_word_weight_hist;
delete from pg_word_user_translation;
