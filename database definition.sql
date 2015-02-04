-- TEST tables
DROP TABLE IF EXISTS pg_test_table;
CREATE TABLE pg_test_table
(
  id SERIAL,
  user_id INTEGER,
  first_name CHARACTER VARYING,
  last_name CHARACTER VARYING,
  address CHARACTER VARYING
)
WITH (
  OIDS=FALSE
);
ALTER TABLE pg_test_table
  OWNER TO postgres;

-- Table: pgwordfrequency
-- DROP TABLE pgwordfrequency;
DROP TABLE IF EXISTS pgwordfrequency;
CREATE TABLE pgwordfrequency
(
  word character varying NOT NULL,
  affix_rules character(7),
  frequency integer,
  freq_cat character(1),
  CONSTRAINT pgwordfrequency_pkey PRIMARY KEY (word)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE pgwordfrequency
  OWNER TO postgres;

-- Index: freq_idx

-- DROP INDEX freq_idx;
CREATE INDEX freq_idx
  ON pgwordfrequency
  USING btree
  (frequency);

-- Index: word_idx

-- DROP INDEX word_idx;

CREATE INDEX word_idx
  ON pgwordfrequency
  USING gin
  (to_tsvector('cs'::regconfig, word::text));

----------

-- Table: pg_notepad
DROP TABLE IF EXISTS pg_notepad;
CREATE TABLE pg_notepad
(
  note_id serial,
  module CHARACTER VARYING (50),
  first_language CHAR(3),
  target_language CHAR(3),
  user_id INTEGER,
  url CHARACTER VARYING,
  word CHARACTER VARYING,
  lemma CHARACTER VARYING,
  context_sentence CHARACTER VARYING,
  index INTEGER,
  CONSTRAINT pg_notepad_pkey PRIMARY KEY (note_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE pg_notepad
  OWNER TO postgres;

CREATE INDEX pg_notepad_idx
  ON pg_notepad
  USING btree
  (note_id);

CREATE INDEX pg_notepad_url_idx
  ON pg_notepad
  USING btree
  (module, user_id, url);

---------- tables for time-spaced-repetition module
DROP TABLE IF EXISTS pg_tsr_word_weight;
CREATE TABLE pg_tsr_word_weight
(
  id SERIAL,
  first_language CHAR(3), -- not necessary but kept for redundancy reasons
  target_language CHAR(3), -- necessary : user might learn two languages which might have same words
  user_id INTEGER,
  word character varying, -- this is in fact a lemma, as we do not TSR words but lemmas
  box_weight INTEGER,
  last_revision_time character varying,
  last_revision_easyness SMALLINT,
  last_revision_exercise_type SMALLINT,
  last_revision_grade SMALLINT --,
--  last_mistake SMALLINT,
--  last_word_distance SMALLINT
)
WITH (
  OIDS=FALSE
);
ALTER TABLE pg_tsr_word_weight
  OWNER TO postgres;

CREATE INDEX pg_tsr_word_weight_idx
  ON pg_tsr_word_weight
  USING btree
  (user_id, word, target_language);
---
DROP TABLE IF EXISTS pg_tsr_word_weight_cfg;
CREATE TABLE pg_tsr_word_weight_cfg
( -- the config for the word TSR learning however should be independant of the first and target language
  user_id INTEGER,
  mem_bucket_size SMALLINT,
  age_param1 SMALLINT,
  age_param2 SMALLINT,
  progress_param1 SMALLINT,
  progress_param2 SMALLINT,
  difficulty_param1 SMALLINT,
  difficulty_param2 SMALLINT,
  bucket_weight0 SMALLINT,
  bucket_weight1 SMALLINT,
  bucket_weight2 SMALLINT,
  bucket_weight3 SMALLINT,
  CONSTRAINT pg_tsr_word_weight_cfg_pkey PRIMARY KEY (user_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE pg_tsr_word_weight_cfg
  OWNER TO postgres;

CREATE INDEX pg_tsr_word_weight_cfg_idx
  ON pg_tsr_word_weight_cfg
  USING btree
  (user_id);
--- Corresponding historical tables
---------- tables for time-spaced-repetition module
DROP TABLE IF EXISTS pg_tsr_word_weight_hist;
CREATE TABLE pg_tsr_word_weight_hist
( -- !! We have a dependency here vs. pg_tsr_word_weight : spec. must coincide
  id INTEGER, -- not serial, as we copy the serial from the original tabl
  first_language CHAR(3), -- not necessary but kept for redundancy reasons
  target_language CHAR(3), -- necessary : user might learn two languages which might have same words
  user_id INTEGER,
  word character varying,
  box_weight INTEGER,
  last_revision_time character varying,
  last_revision_easyness SMALLINT,
  last_revision_exercise_type SMALLINT,
  last_revision_grade SMALLINT,
--  last_mistake SMALLINT,
--  last_word_distance SMALLINT,
  created_time character varying -- new historical field
)
WITH (
  OIDS=FALSE
);
ALTER TABLE pg_tsr_word_weight_hist
  OWNER TO postgres;

CREATE INDEX pg_tsr_word_weight_hist_word_idx
  ON pg_tsr_word_weight_hist
  USING btree
  (user_id, word);

CREATE INDEX pg_tsr_word_weight_hist_id_idx
  ON pg_tsr_word_weight_hist
  USING btree
  (id);
----------
---------- tables for storing translation entered by the user
DROP TABLE IF EXISTS pg_word_user_translation;
CREATE TABLE pg_word_user_translation
(
  id SERIAL,
  user_id INTEGER,
  first_language CHAR(3),
  target_language CHAR(3),
  word CHARACTER VARYING,
  lemma CHARACTER VARYING,
  morph_info CHARACTER VARYING,
  lemma_translation CHARACTER VARYING,
  sample_sentence_first_lg CHARACTER VARYING,
  sample_sentence_target_lg CHARACTER VARYING
)
WITH (
  OIDS=FALSE
);
ALTER TABLE pg_word_user_translation
  OWNER TO postgres;

CREATE INDEX pg_word_user_translation_idx
  ON pg_word_user_translation
  USING btree
  (user_id, word, lemma);
