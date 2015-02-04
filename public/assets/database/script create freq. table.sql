/* !! Drop table only if it exists already */
DROP TABLE IF EXISTS pgWordFrequency;
CREATE TABLE IF NOT EXISTS pgWordFrequency
(word varchar, affix_rules char(7), frequency integer, freq_cat char(1), PRIMARY KEY(word));

copy pgWordFrequency from 'C:\Documents and Settings\bcouriol\coding\Webstorm\Airlang\public\assets\database\pgWordFrequency.csv'
DELIMITERS ',' NULL AS ' ' CSV HEADER;

CREATE INDEX word_idx ON pgWordFrequency USING gin(to_tsvector('cs', word));
CREATE INDEX freq_idx ON pgWordFrequency(frequency);

/* set frequency information. Arbitraty default is 12.000 */
UPDATE pgWordFrequency set freq_cat = '';
UPDATE pgWordFrequency set freq_cat = 'A' where frequency > 12000;

-- create table short (which is the same but a rank column instead of affix rules)
DROP TABLE IF EXISTS pgwordfrequency_short;
CREATE TABLE IF NOT EXISTS pgwordfrequency_short
(
  rank integer,
  lemma character varying,
  absolute_frequency integer,
  freq_cat character(2)
)

COPY pgwordfrequency_short FROM 'C:\Documents and Settings\bcouriol\coding\Webstorm\Airlang\public\assets\database\pgwordfrequency_short.csv'
DELIMITER ',' NULL AS ' ' CSV HEADER;

-- maybe an index on lemma?
CREATE INDEX lemma_btree_idx ON pgwordfrequency_short(lemma);
