-- select * from pg_notepad;

-- delete from pg_notepad where note_id > 2
-- delete from pg_tsr_word_weight;
-- delete from pg_tsr_word_weight_cfg;

-- select * from pg_tsr_word_weight;
-- select * from pg_tsr_word_weight_cfg

----- Test data 1:
----- less than 20 values
DELETE FROM pg_tsr_word_weight_cfg;
INSERT INTO pg_tsr_word_weight_cfg values (1, 20, 1, 3, 1, 5, 1, 1, 27, 9, 3, 1);

DELETE FROM pg_tsr_word_weight;
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (29,1,'společností.',27,'2014-11-30T01:08:03.540+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (30,1,'materiálu',27,'2014-11-30T01:08:09.565+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (31,1,'uvádí',27,'2014-11-30T01:08:11.326+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (32,1,'takzvaný',27,'2014-11-30T01:08:21.208+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (33,1,'nemyslitelné,',27,'2014-11-30T01:09:31.053+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (34,1,'naprosto',27,'2014-11-30T01:09:35.436+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (35,1,'vzdali',27,'2014-11-30T01:09:39.674+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (36,1,'postupně',27,'2014-11-30T01:09:46.540+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (37,1,'jedinečného',27,'2014-11-30T01:10:09.988+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (38,1,'zásadní',27,'2014-11-30T01:10:15.586+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (39,1,'tisku',27,'2014-11-30T01:10:25.614+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (40,1,'mínění,',27,'2014-11-30T01:10:29.345+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (41,1,'přispívat',27,'2014-11-30T01:10:33.672+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (42,1,'utváření',27,'2014-11-30T01:10:36.798+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (43,1,'programátoři,',27,'2014-11-30T01:11:50.636+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (44,1,'převzít',27,'2014-11-30T01:11:55.442+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (45,1,'Vydavatelé,',27,'2014-11-30T01:11:59.330+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (46,1,'překladatelé',27,'2014-11-30T01:12:05.905+01:00',1,1,0);
