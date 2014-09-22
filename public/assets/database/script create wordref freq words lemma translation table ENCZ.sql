DROP TABLE IF EXISTS pgLemmaEN;
CREATE TABLE IF NOT EXISTS pgLemmaEN
(lemma varchar, sense varchar, lemma_sense_id integer UNIQUE, lemma_gram_info varchar, lemma_lex_info varchar/*, CONSTRAINT lemma_sense PRIMARY KEY(lemma,sense)*/);

copy pgLemmaEN from 'C:\Documents and Settings\bcouriol\coding\Webstorm\JS_ME\assets\database\pgLemmaEN.csv'
DELIMITERS ';' NULL AS 'null' CSV HEADER;

-- first copy into orig, then split translation_lemma of the form word, word into separate rows
DROP TABLE IF EXISTS pgLemmaTranslationCZ_orig;
CREATE TABLE IF NOT EXISTS pgLemmaTranslationCZ_orig
(lemma_sense_id integer, translation_lemma varchar, translation_sense varchar, translation_gram_info varchar, translation_lex_info varchar);

copy pgLemmaTranslationCZ_orig from 'C:\Documents and Settings\bcouriol\coding\Webstorm\JS_ME\assets\database\pgLemmaTranslationCZ.csv'
DELIMITERS ';' NULL AS 'null' CSV HEADER;

DROP TABLE IF EXISTS pgLemmaTranslationCZ;
SELECT
  lemma_sense_id,
  regexp_split_to_table(pgLemmaTranslationCZ_orig.translation_lemma, E', ') as translation_lemma,
  pgLemmaTranslationCZ_orig.translation_lemma as translation_lemma_orig,
  translation_sense,
  translation_gram_info,
  translation_lex_info
  INTO pgLemmaTranslationCZ
FROM
  pgLemmaTranslationCZ_orig;

-------- Create table of sample translations

DROP TABLE IF EXISTS pgSampleSentenceENCZ;
CREATE TABLE IF NOT EXISTS pgSampleSentenceENCZ
(lemma_sense_id integer, example_sentence_from varchar, example_sentence_to varchar);

copy pgSampleSentenceENCZ from 'C:\Documents and Settings\bcouriol\coding\Webstorm\JS_ME\assets\database\pgSampleSentenceENCZ.csv'
DELIMITERS ';' NULL AS 'null' CSV HEADER;

-- indexes creation
-- support queries by sense_id and translation_lemma (lower caps)
CREATE INDEX pgLemmaEN_sense_idx ON pgLemmaEN(lemma_sense_id);
CREATE INDEX pgLemmaEN_lemma_sense_idx ON pgLemmaEN(lemma, sense);
CREATE INDEX pgLemmaTranslationCZ_translation_lemma ON pgLemmaTranslationCZ(LOWER(translation_lemma));
CREATE INDEX pgLemmaTranslationCZ_sense_idx ON pgLemmaTranslationCZ(lemma_sense_id);
CREATE INDEX pgSampleSentenceENCZ_sense_idx ON pgSampleSentenceENCZ(lemma_sense_id);

-------- Query to join all three translation tables together
SELECT DISTINCT
  pglemmatranslationcz.translation_lemma,
  pglemmaen.lemma_sense_id,
  pglemmatranslationcz.translation_sense,
  pglemmaen.lemma_gram_info,
  pglemmaen.lemma,
  pglemmaen.sense,
  pglemmatranslationcz.translation_gram_info,
  pgsamplesentenceencz.example_sentence_from,
  pgsamplesentenceencz.example_sentence_to,
  pgwordfrequency_short.freq_cat
FROM
  public.pglemmaen
  INNER JOIN public.pglemmatranslationcz ON (pglemmatranslationcz.lemma_sense_id = pglemmaen.lemma_sense_id)
  LEFT JOIN public.pgsamplesentenceencz ON (pglemmatranslationcz.lemma_sense_id = public.pgsamplesentenceencz.lemma_sense_id)
  INNER JOIN public.pgwordfrequency_short on (pglemmatranslationcz.translation_lemma = pgwordfrequency_short.lemma)
-- 8171 rows

select * from
public.pglemmaen
--7221 rows

select * from
  public.pglemmaen
  INNER JOIN public.pglemmatranslationcz ON (pglemmatranslationcz.lemma_sense_id = pglemmaen.lemma_sense_id)
--15555 rows

select * from
  public.pglemmaen
  INNER JOIN public.pglemmatranslationcz ON (pglemmatranslationcz.lemma_sense_id = pglemmaen.lemma_sense_id)
  LEFT JOIN public.pgsamplesentenceencz ON (pglemmatranslationcz.lemma_sense_id = public.pgsamplesentenceencz.lemma_sense_id)
--15623 rows

