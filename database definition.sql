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

----------
