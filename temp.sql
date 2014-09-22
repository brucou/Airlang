--- Query to get word input and freq
select LEMMA_TABLE.word, pgwordfrequency.frequency
from (select ((ts_lexize('cspell', word))[1]) as lemma, word from (select regexp_split_to_table('Horkdddé letní počasí přeruší bouřky a pršet bude až do pátku', E'\\s+') as word) as TEXT_INPUT)
          as LEMMA_TABLE
          LEFT OUTER JOIN pgwordfrequency
     ON pgwordfrequency.word = LEMMA_TABLE.lemma;

--- prepared statement example
prepare qen2 as
select t.*
from t
join (
 SELECT id from
  (
  SELECT 'n' as fld, id from u where u.name = $1
  UNION ALL
  SELECT 'e' as fld, id from u where u.email = $1
  ) poly
 where poly.fld = $2
) uu
on t.user_id = uu.id;

explain analyze execute qen2('1111','n');

--- other prepapred statement example
PREPARE usrrptplan (int) AS
    SELECT * FROM users u, logs l WHERE u.usrid=$1 AND u.usrid=l.usrid
    AND l.date = $2;
EXECUTE usrrptplan(1, current_date);
