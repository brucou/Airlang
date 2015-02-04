-- the procedure is the following
-- 1. select the words to be scrapped from wr
-- 2. run the scrapper
-- 3. copy the result (^A) to the helper excel file
-- 4. copy back the three tables to the corresponding sheets
-- 5. follow instructions (replace isntruction '' for ' etc.)
-- 6. execute the corresponding INSERT scripts
-- 7. execute the following scripts to normalize the table pglemmatranslationcz

-- first add the lines with several translations, splitting in as many rows as translation, and filling in the field translation_lemma
INSERT INTO pglemmatranslationcz (lemma_sense_id, translation_lemma_orig, translation_sense,  translation_gram_info, translation_lex_info, translation_lemma)
SELECT lemma_sense_id, translation_lemma_orig, translation_sense,  translation_gram_info, translation_lex_info,
       trim(regexp_split_to_table(translation_lemma_orig, E','))
FROM pglemmatranslationcz
WHERE translation_lemma_orig like '%, %'
AND translation_lemma is null;
-- then add the lines with only one translation, simply copying translation_lemma_orig into translation_lemma
INSERT INTO pglemmatranslationcz (lemma_sense_id, translation_lemma_orig, translation_sense,  translation_gram_info, translation_lex_info, translation_lemma)
SELECT lemma_sense_id, translation_lemma_orig, translation_sense,  translation_gram_info, translation_lex_info,
       translation_lemma_orig
FROM pglemmatranslationcz
WHERE translation_lemma_orig not like '%, %'
AND translation_lemma is null;
-- job is finished, we can delete those lines which are now duplicated
DELETE from pglemmatranslationcz where translation_lemma is null;

-- additional queries but for checking purposes
-- select * from pglemmaen where lemma_sense_id > 16209
-- select * from pglemmatranslationcz where translation_lemma is null
-- select * from pglemmatranslationcz where lemma_sense_id > 16209
