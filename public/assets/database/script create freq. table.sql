/* !! Drop table only if it exists already */
DROP TABLE pgWordFrequency;
CREATE TABLE pgWordFrequency 
(word varchar, affix_rules char(7), frequency integer, freq_cat char(1), PRIMARY KEY(word));

copy pgWordFrequency from 'C:\Documents and Settings\bcouriol\coding\Webstorm\JS_ME\assets\database\freq_table.csv'
DELIMITERS ',' NULL AS ' ' CSV HEADER;

CREATE INDEX word_idx ON pgWordFrequency USING gin(to_tsvector('cs', word));
CREATE INDEX freq_idx ON pgWordFrequency(frequency);

/* set frequency information. Arbitraty default is 12.000 */
UPDATE pgWordFrequency set freq_cat = '';
UPDATE pgWordFrequency set freq_cat = 'A' where frequency > 12000;


