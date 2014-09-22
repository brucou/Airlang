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
