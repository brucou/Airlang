-- Table: pgwordfrequency

-- DROP TABLE pgwordfrequency;

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
CREATE TABLE pg_notepad
(
  note_id serial,
  module character varying (50),
  user_id integer,
  url character varying,
  word character varying,
  context_sentence character varying,
  index integer,
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
CREATE TABLE pg_tsr_word_weight
(
  id SERIAL,
  user_id INTEGER,
  word character varying,
  box_weight INTEGER,
  last_revision_time character varying,
  last_revision_easyness SMALLINT,
  last_revision_exercise_type SMALLINT,
  last_revision_grade SMALLINT
)
WITH (
  OIDS=FALSE
);
ALTER TABLE pg_tsr_word_weight
  OWNER TO postgres;

CREATE INDEX pg_tsr_word_weight_idx
  ON pg_tsr_word_weight
  USING btree
  (user_id, word);
---
CREATE TABLE pg_tsr_word_weight_cfg
(
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
CREATE TABLE pg_tsr_word_weight_hist
(
  id INTEGER, -- not serial, as we copy the serial from the original table
  user_id INTEGER,
  word character varying,
  box_weight INTEGER,
  last_revision_time character varying,
  last_revision_easyness SMALLINT,
  last_revision_exercise_type SMALLINT,
  last_revision_grade SMALLINT,
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
