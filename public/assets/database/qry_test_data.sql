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
-- should change periodically the date to avoid having it too old to compare with new values
-- ACHTUNG : necessary to add 1 as exercise_type, or change it in the program
DELETE FROM pg_notepad;
DELETE FROM pg_tsr_word_weight;
--  first_language CHAR(3),
--    target_language CHAR(3),
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (136,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','firma','- iDNES.cz Shaangu získá v rámci dohody ''letter of intent'', která vymezuje obsah budoucí smlouvy, exkluzivitu pro jednání s českou firmou na dobu 120 dní, uvádí se v materiálu zveřejněném čínskou společností. Shaangu v té době uskuteční v české firmě',30);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (137,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','dohoda',' Číňané koupí brněnského výrobce turbín Ekol, zaplatí 1,3 miliardy - iDNES.cz Shaangu získá v rámci dohody ''letter of intent'', která vymezuje obsah budoucí smlouvy, exkluzivitu pro jednání s českou firmou na dobu 120 dní, uvádí',16);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (138,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','získat',' Číňané koupí brněnského výrobce turbín Ekol, zaplatí 1,3 miliardy - iDNES.cz Shaangu získá v rámci dohody ''letter of intent'', která vymezuje obsah budoucí smlouvy, exkluzivitu pro jednání s českou firmou na dobu',13);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (139,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','podat','Shaangu v té době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný ''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské',62);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (140,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','nabídka','době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný ''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, (...)',65);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (141,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','zařízení','procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české v (...)',89);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (142,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','rozhodnout','čínskou společností. Shaangu v té době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný ''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je',60);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (143,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','vyrábět','Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost E (...)',84);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (144,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','skupina','Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české výrobce turbin, její tržby předloni dosáhly 1,5 m (...)',97);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (145,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','dosáhnout','energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české výrobce turbin, její tržby předloni dosáhly 1,5 miliardy Kč. Podstatná část její produkce míří na vývoz. Ekol vlastní 51 procent ve firmě EKOL TURBO, a. (...)',111);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (146,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','prověrka','na dobu 120 dní, uvádí se v materiálu zveřejněném čínskou společností. Shaangu v té době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný ''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích',51);
INSERT INTO pg_notepad(note_id, module,  first_language, target_language, user_id,  url,  word,  context_sentence,  index) VALUES (147,'reader tool','eng','cze',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','sídlo','''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma',75);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (112,'eng','cze',1,'firma',27,'2014-12-14T05:47:07.863+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (113,'eng','cze',1,'dohoda',27,'2014-12-14T05:47:17.145+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (114,'eng','cze',1,'získat',27,'2014-12-14T05:47:27.998+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (115,'eng','cze',1,'podat',27,'2014-12-14T05:48:12.204+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (116,'eng','cze',1,'nabídka',27,'2014-12-14T05:48:23.803+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (117,'eng','cze',1,'zařízení',27,'2014-12-14T05:48:37.774+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (118,'eng','cze',1,'rozhodnout',27,'2014-12-14T05:54:23.548+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (119,'eng','cze',1,'vyrábět',27,'2014-12-14T05:56:11.404+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (120,'eng','cze',1,'skupina',27,'2014-12-14T05:58:35.378+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (121,'eng','cze',1,'dosáhnout',27,'2014-12-14T05:59:39.590+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (122,'eng','cze',1,'prověrka',27,'2014-12-14T06:02:31.025+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (123,'eng','cze',1,'sídlo',27,'2014-12-14T06:06:02.453+01:00',1,1,0);


----- Test data 2:
--
-- PostgreSQL database dump
--
-- Dumped from database version 9.3.4
-- Dumped by pg_dump version 9.3.4
-- Started on 2014-12-26 00:55:22
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET search_path = public, pg_catalog;
--
-- TOC entry 1995 (class 0 OID 25139)
-- Dependencies: 179
-- Data for Name: pg_notepad; Type: TABLE DATA; Schema: public; Owner: postgres
--
DELETE FROM pg_notepad;
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (12, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'dohody', 'dohoda', ' Číňané koupí brněnského výrobce turbín Ekol, zaplatí 1,3 miliardy - iDNES.cz Shaangu získá v rámci dohody "letter of intent", která vymezuje obsah budoucí smlouvy, exkluzivitu pro jednání s českou firmou na dobu 120 dní, uvádí', 16);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (13, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'získá', 'získat', ' Číňané koupí brněnského výrobce turbín Ekol, zaplatí 1,3 miliardy - iDNES.cz Shaangu získá v rámci dohody "letter of intent", která vymezuje obsah budoucí smlouvy, exkluzivitu pro jednání s českou firmou na dobu', 13);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (14, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'rozhodne', 'rozhodnout', 'čínskou společností. Shaangu v té době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný "due diligence", a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je', 60);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (15, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'firmě', 'firma', 'českou firmou na dobu 120 dní, uvádí se v materiálu zveřejněném čínskou společností. Shaangu v té době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný "due diligence", a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100', 49);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (16, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'zařízení', 'zařízení', 'procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české výrobce turbin, její', 89);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (17, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'součástí', 'součást', 'v Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české výrobce turbin, její tržby předloni dosáhly 1,5 miliardy Kč. Podstatná', 96);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (18, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'patří', 'patřit', 'province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české výrobce turbin, její tržby předloni dosáhly 1,5 miliardy Kč. Podstatná část její produkce míří na vývoz.', 102);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (19, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'nabídku', 'nabídka', 'době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný "due diligence", a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, vyrábí', 65);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (20, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'průmysl', 'průmysl', 'Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české výrobce turbin, její tržby předloni dosáhly 1,5', 93);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (21, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'dosáhly', 'dosáhnout', 'energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české výrobce turbin, její tržby předloni dosáhly 1,5 miliardy Kč. Podstatná část její produkce míří na vývoz. Ekol vlastní 51 procent ve firmě EKOL TURBO, a.s.', 111);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (22, 'reader tool', 'eng', 'cze', 1, 'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq', 'obsah', 'obsah', 'koupí brněnského výrobce turbín Ekol, zaplatí 1,3 miliardy - iDNES.cz Shaangu získá v rámci dohody "letter of intent", která vymezuje obsah budoucí smlouvy, exkluzivitu pro jednání s českou firmou na dobu 120 dní, uvádí se v materiálu zveřejněném čínskou společností.', 22);
--
-- TOC entry 2008 (class 0 OID 0)
-- Dependencies: 178
-- Name: pg_notepad_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--
SELECT pg_catalog.setval('pg_notepad_note_id_seq', 22, true);
--
-- TOC entry 1997 (class 0 OID 25152)
-- Dependencies: 181
-- Data for Name: pg_tsr_word_weight; Type: TABLE DATA; Schema: public; Owner: postgres
--
DELETE FROM pg_tsr_word_weight;
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (6, 'eng', 'cze', 1, 'dohoda', 27, '2014-12-26T00:49:14.589+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (7, 'eng', 'cze', 1, 'získat', 27, '2014-12-26T00:49:40.380+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (8, 'eng', 'cze', 1, 'rozhodnout', 27, '2014-12-26T00:50:52.674+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (9, 'eng', 'cze', 1, 'firma', 27, '2014-12-26T00:51:14.300+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (10, 'eng', 'cze', 1, 'zařízení', 27, '2014-12-26T00:51:25.389+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (11, 'eng', 'cze', 1, 'součást', 27, '2014-12-26T00:51:40.469+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (12, 'eng', 'cze', 1, 'patřit', 27, '2014-12-26T00:51:49.452+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (13, 'eng', 'cze', 1, 'nabídka', 27, '2014-12-26T00:52:30.804+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (14, 'eng', 'cze', 1, 'průmysl', 27, '2014-12-26T00:52:40.112+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (15, 'eng', 'cze', 1, 'dosáhnout', 27, '2014-12-26T00:52:50.924+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (16, 'eng', 'cze', 1, 'obsah', 27, '2014-12-26T00:53:09.721+01:00', 1, 1, 0);
--
-- TOC entry 1998 (class 0 OID 25160)
-- Dependencies: 182
-- Data for Name: pg_tsr_word_weight_cfg; Type: TABLE DATA; Schema: public; Owner: postgres
--
DELETE FROM pg_tsr_word_weight_cfg;
INSERT INTO pg_tsr_word_weight_cfg (user_id, mem_bucket_size, age_param1, age_param2, progress_param1, progress_param2, difficulty_param1, difficulty_param2, bucket_weight0, bucket_weight1, bucket_weight2, bucket_weight3) VALUES (1, 20, 1, 3, 1, 5, 1, 1, 27, 9, 3, 1);
--
-- TOC entry 2009 (class 0 OID 0)
-- Dependencies: 180
-- Name: pg_tsr_word_weight_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--
SELECT pg_catalog.setval('pg_tsr_word_weight_id_seq', 16, true);
--
-- TOC entry 2000 (class 0 OID 25176)
-- Dependencies: 185
-- Data for Name: pg_word_user_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--
delete from  pg_word_user_translation;
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (12, 1, 'eng', 'cze', 'dohody', 'dohoda', '-', 'deal', 'The two sides made a deal.', 'Obě strany uzavřely dohodu ( or: obchod).');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (13, 1, 'eng', 'cze', 'získá', 'získat', '-', 'gain', 'The citizens gained the right to send their kids to a different school.', 'Občané dostali ( or: získali) právo posílat své děti do jiné školy.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (14, 1, 'eng', 'cze', 'rozhodne', 'rozhodnout', '-', 'decide', NULL, NULL);
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (15, 1, 'eng', 'cze', 'firmě', 'firma', '-', 'company', 'Mike works for a large company.', 'Mike pracuje pro jednu velkou společnost ( or: firmu).');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (16, 1, 'eng', 'cze', 'zařízení', 'zařízení', '-', 'device', 'This futuristic device sweeps the floors by itself.', 'Tento futuristický přístroj umí sám zametat podlahu.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (17, 1, 'eng', 'cze', 'součástí', 'součást', '-', 'element', 'Good grammar is just one element of good writing.', 'Dobrá gramatika je jen jednou ze součástí dobrého psaní.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (18, 1, 'eng', 'cze', 'patří', 'patřit', '-', 'belong', 'The chair belongs by the table.', 'Ta židle patří ke stolu.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (19, 1, 'eng', 'cze', 'nabídku', 'nabídka', '-', 'offer', 'The offer of five thousand pounds for the car was rejected by the vendor.', 'Nabízená částka 5 000 liber byla prodávajícím odmítnuta.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (20, 1, 'eng', 'cze', 'průmysl', 'průmysl', '-', 'industry', '', '');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (21, 1, 'eng', 'cze', 'dosáhly', 'dosáhnout', '-', 'reach', 'The rocket may reach Mars if it has enough fuel.', 'Raketa může doletět na Mars, pokud má dost paliva.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (22, 1, 'eng', 'cze', 'obsah', 'obsah', '-', 'content', 'The content of the essay is interesting and important.', 'Obsah tohoto eseje je zajímavý a důležitý.');
--
-- TOC entry 2010 (class 0 OID 0)
-- Dependencies: 184
-- Name: pg_word_user_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--
SELECT pg_catalog.setval('pg_word_user_translation_id_seq', 22, true);
-- Completed on 2014-12-26 00:55:23
--
-- PostgreSQL database dump complete
--


-- something else : create a loading animation
function(){
var p=document.createElement("p");
p.innerHTML="<strong>Loading…</strong>";
p.id="loadingp";p.style.padding="20px";p.style.background="#fff";p.style.left="20px";p.style.top=0;p.style.position="fixed";p.style.zIndex="9999999";p.style.opacity=".85";document.body.appendChild(p);
document.body.appendChild(document.createElement("script")).src="https://gist.github.com/ttscoff/6109434/raw/Bullseye.js?x="+(Math.random());})();
