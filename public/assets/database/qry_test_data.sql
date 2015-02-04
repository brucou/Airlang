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

----- Test data 2:
-- less than 20 values
--
-- TOC entry 1996 (class 0 OID 25139)
-- Dependencies: 176
-- Data for Name: pg_notepad; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (79, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'zemřelo', 'zemřít', 'nejrychleji dostala. Podle odhadů konzulátu v Charkově žije na východní Ukrajině asi 400 lidí s polskými kořeny. Podle Spojených národů zemřelo při bojích mezi ukrajinskými vládními jednotkami a proruskými separatisty od loňského dubna už více než 4700 lidí. Je mezi', 303);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (62, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'strach', 'strach', ' DPA: Utečenců z rozbombardované východní Ukrajiny přibývá - ČeskéNoviny.cz Doněck (Ukrajina) - Střelba, strach a zima, každodenní boj o přežití. Anatolij Terlecki, který žije nedaleko zničeného doněckého letiště, je na východě Ukrajiny denně', 14);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (63, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'přibývá', 'přibývat', ' DPA: Utečenců z rozbombardované východní Ukrajiny přibývá - ČeskéNoviny.cz Doněck (Ukrajina) - Střelba, strach a zima, každodenní boj o přežití. Anatolij Terlecki, který žije nedaleko zničeného', 7);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (64, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'zima', 'zima', ' DPA: Utečenců z rozbombardované východní Ukrajiny přibývá - ČeskéNoviny.cz Doněck (Ukrajina) - Střelba, strach a zima, každodenní boj o přežití. Anatolij Terlecki, který žije nedaleko zničeného doněckého letiště, je na východě Ukrajiny denně svědkem bojů.', 16);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (65, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'boj', 'boj', ' DPA: Utečenců z rozbombardované východní Ukrajiny přibývá - ČeskéNoviny.cz Doněck (Ukrajina) - Střelba, strach a zima, každodenní boj o přežití. Anatolij Terlecki, který žije nedaleko zničeného doněckého letiště, je na východě Ukrajiny denně svědkem bojů. ''Na ulicích', 18);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (66, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'svědkem', 'svědek', 'strach a zima, každodenní boj o přežití. Anatolij Terlecki, který žije nedaleko zničeného doněckého letiště, je na východě Ukrajiny denně svědkem bojů. ''Na ulicích se střílí, je třeskutá zima,'' říká předseda Společnosti Poláků na východní Ukrajině polské agentuře PAP. ''Každý', 34);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (67, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'následky', 'následek', 'PAP. ''Každý den je těžký,'' dodává. Má strach, že jeho dům může kdykoli zasáhnout granát, zbloudilá střela může mít tragické následky, kdykoli jde jeho žena koupit potraviny. Terlecki má ale naději: evakuaci do Polska. ''Čekáme jen na odjezd,'' říká. Krvavý', 72);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (68, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'naději', 'naděje', 'dům může kdykoli zasáhnout granát, zbloudilá střela může mít tragické následky, kdykoli jde jeho žena koupit potraviny. Terlecki má ale naději: evakuaci do Polska. ''Čekáme jen na odjezd,'' říká. Krvavý konflikt na východní Ukrajině už vyhnal z domovů asi milion', 82);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (69, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'setrvali', 'setrvat', 'Ukrajině už vyhnal z domovů asi milion lidí. Ti, kteří v Doněcku, Luhansku a dalších místech v krizové oblasti ještě setrvali, jsou sklíčení a chtějí už jen pryč. Je mezi nimi mnoho příslušníků etnických menšin, kteří doufají v pomoc zemí,', 115);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (70, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'znepokojení', 'znepokojení', 'nich asi 3000 na Krymu. Německý vládní pověřenec Hartmut Koschyk po jedné ze svých cest na Ukrajinu mluvil o ''velkém znepokojení u německé i u jiných menšin''. Podle agentury DPA varoval před možnými ''panickými reakcemi ve formě žádostí o vystěhování''.', 178);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (71, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'varoval', 'varovat', 'po jedné ze svých cest na Ukrajinu mluvil o ''velkém znepokojení u německé i u jiných menšin''. Podle agentury DPA varoval před možnými ''panickými reakcemi ve formě žádostí o vystěhování''. Německo a EU podle něj očekávají od ukrajinského vedení jasný', 188);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (72, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'závazek', 'závazek', 'varoval před možnými ''panickými reakcemi ve formě žádostí o vystěhování''. Německo a EU podle něj očekávají od ukrajinského vedení jasný závazek, že se všechny menšiny dočkají náležité ochrany. Prozápadní vláda v Kyjevě to několikrát slíbila. Polská vláda na žádosti o', 208);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (73, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'ochrany', 'ochrana', 'žádostí o vystěhování''. Německo a EU podle něj očekávají od ukrajinského vedení jasný závazek, že se všechny menšiny dočkají náležité ochrany. Prozápadní vláda v Kyjevě to několikrát slíbila. Polská vláda na žádosti o vystěhování čekat nechce. Příslušníci polské menšiny sice', 215);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (74, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'náležité', 'náležitý', 'formě žádostí o vystěhování''. Německo a EU podle něj očekávají od ukrajinského vedení jasný závazek, že se všechny menšiny dočkají náležité ochrany. Prozápadní vláda v Kyjevě to několikrát slíbila. Polská vláda na žádosti o vystěhování čekat nechce. Příslušníci polské menšiny', 214);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (75, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'slíbila', 'slíbit', 'něj očekávají od ukrajinského vedení jasný závazek, že se všechny menšiny dočkají náležité ochrany. Prozápadní vláda v Kyjevě to několikrát slíbila. Polská vláda na žádosti o vystěhování čekat nechce. Příslušníci polské menšiny sice žijí převážně na západní Ukrajině, která byla', 222);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (76, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'převážně', 'převážně', 'Prozápadní vláda v Kyjevě to několikrát slíbila. Polská vláda na žádosti o vystěhování čekat nechce. Příslušníci polské menšiny sice žijí převážně na západní Ukrajině, která byla do roku 1939 součástí Polska, polské ministerstvo zahraničí ale přesto poslalo v prosinci na', 236);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (77, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'přesto', 'přesto', 'Příslušníci polské menšiny sice žijí převážně na západní Ukrajině, která byla do roku 1939 součástí Polska, polské ministerstvo zahraničí ale přesto poslalo v prosinci na Ukrajinu náměstka, aby sestavil s pomocí charkovského konzulátu seznam těch, kteří se chtějí z východní', 251);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (78, 'reader tool', 'eng', 'cze', 1, 'http://www.ceskenoviny.cz/svet/ukrajina/zpravy/dpa-utecencu-z-rozbombardovane-vychodni-ukrajiny-pribyva/1167572', 'požaduje', 'požadovat', 'Ukrajinu náměstka, aby sestavil s pomocí charkovského konzulátu seznam těch, kteří se chtějí z východní Ukrajiny dostat. Také konzervativní opozice požaduje, aby vláda Poláky z Donbasu co nejrychleji dostala. Podle odhadů konzulátu v Charkově žije na východní Ukrajině asi 400', 276);


--
-- TOC entry 2008 (class 0 OID 0)
-- Dependencies: 175
-- Name: pg_notepad_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('pg_notepad_note_id_seq', 79, true);


--
-- TOC entry 1998 (class 0 OID 25152)
-- Dependencies: 178
-- Data for Name: pg_tsr_word_weight; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (55, 'eng', 'cze', 1, 'strach', 27, '2015-01-12T13:31:36.262+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (56, 'eng', 'cze', 1, 'přibývat', 27, '2015-01-12T13:36:14.345+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (57, 'eng', 'cze', 1, 'zima', 27, '2015-01-12T13:38:53.082+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (58, 'eng', 'cze', 1, 'boj', 27, '2015-01-12T13:39:48.961+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (59, 'eng', 'cze', 1, 'svědek', 27, '2015-01-12T13:40:12.697+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (60, 'eng', 'cze', 1, 'následek', 27, '2015-01-12T13:41:16.238+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (61, 'eng', 'cze', 1, 'naděje', 27, '2015-01-12T13:41:38.466+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (62, 'eng', 'cze', 1, 'setrvat', 27, '2015-01-12T13:42:16.995+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (63, 'eng', 'cze', 1, 'znepokojení', 27, '2015-01-12T13:44:29.164+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (64, 'eng', 'cze', 1, 'varovat', 27, '2015-01-12T13:44:44.184+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (65, 'eng', 'cze', 1, 'závazek', 27, '2015-01-12T13:45:48.794+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (66, 'eng', 'cze', 1, 'ochrana', 27, '2015-01-12T13:47:00.862+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (67, 'eng', 'cze', 1, 'náležitý', 27, '2015-01-12T13:47:10.930+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (68, 'eng', 'cze', 1, 'slíbit', 27, '2015-01-12T13:48:23.382+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (69, 'eng', 'cze', 1, 'převážně', 27, '2015-01-12T13:49:21.276+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (70, 'eng', 'cze', 1, 'přesto', 27, '2015-01-12T13:50:46.041+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (71, 'eng', 'cze', 1, 'požadovat', 27, '2015-01-12T13:51:53.641+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (72, 'eng', 'cze', 1, 'zemřít', 27, '2015-01-12T13:53:45.401+01:00', 1, 1, 0);


--
-- TOC entry 2009 (class 0 OID 0)
-- Dependencies: 177
-- Name: pg_tsr_word_weight_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('pg_tsr_word_weight_id_seq', 72, true);


--
-- TOC entry 2000 (class 0 OID 25176)
-- Dependencies: 182
-- Data for Name: pg_word_user_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (64, 1, 'eng', 'cze', 'strach', 'strach', '-', 'fear', 'Parents of teenagers have a fear of drugs.', 'Rodiče mají strach, aby jejich děti nepropadly drogám.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (65, 1, 'eng', 'cze', 'přibývá', 'přibývat', '-', 'to increase', NULL, NULL);
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (66, 1, 'eng', 'cze', 'zima', 'zima', '-', 'winter', NULL, NULL);
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (67, 1, 'eng', 'cze', 'boj', 'boj', '-', 'fight', NULL, NULL);
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (68, 1, 'eng', 'cze', 'svědkem', 'svědek', '-', 'witness', 'He was a witness to the crime.', 'Byl svědkem zločinu.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (69, 1, 'eng', 'cze', 'následky', 'následek', '-', 'effect', 'The effect of toasting bread for too long is burnt toast.', 'Výsledkem dlouhého opékání chleba jsou spálené topinky.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (70, 1, 'eng', 'cze', 'naději', 'naděje', '-', 'hope', 'My hope is that you will succeed by hard work.', '|Doufám, že díky tvrdé práci uspěješ.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (71, 1, 'eng', 'cze', 'setrvali', 'setrvat', '-', 'remain', 'He went out, while she remained at home.', 'On odešel, ale ona zůstala ( or: setrvávala) doma.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (72, 1, 'eng', 'cze', 'znepokojení', 'znepokojení', '-', 'concern', 'The gathering storm is a concern for the hikers.', 'Hrozící bouřka způsobila turistům starosti.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (73, 1, 'eng', 'cze', 'varoval', 'varovat', '-', 'warn', NULL, NULL);
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (74, 1, 'eng', 'cze', 'závazek', 'závazek', '-', 'commitment', 'The band has a commitment for Friday night.', 'Ta skupina má na pátek večer závazek ( or: angažmá).');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (75, 1, 'eng', 'cze', 'ochrany', 'ochrana', '-', 'protection', '', '');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (76, 1, 'eng', 'cze', 'náležité', 'náležitý', '-', 'necessary', NULL, NULL);
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (77, 1, 'eng', 'cze', 'slíbila', 'slíbit', '-', 'promise', 'I promised my mom that I would buy postage stamps today.', 'Slíbil jsem matce, že dnes koupím poštovní známky.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (78, 1, 'eng', 'cze', 'převážně', 'převážně', '-', 'mainly', 'The fire department is mainly responsible for fire prevention.', 'Tato hasičská stanice je odpovědná hlavně ( or: především) za požární prevenci.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (79, 1, 'eng', 'cze', 'přesto', 'přesto', '-', 'nevertheless', 'She didn''t like the price. Nevertheless, she bought it anyway.', 'Ta cena se jí nezdála, ale přesto to koupila.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (80, 1, 'eng', 'cze', 'požaduje', 'požadovat', '-', 'demand', 'She demanded that he take out the trash.', 'Požadovala, aby vynesl smetí.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (81, 1, 'eng', 'cze', 'zemřelo', 'zemřít', '-', 'die', 'He died of starvation on March 4, 1782.', '|Zemřel hladem 4. března 1872.');


--
-- TOC entry 2010 (class 0 OID 0)
-- Dependencies: 181
-- Name: pg_word_user_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('pg_word_user_translation_id_seq', 81, true);


-- Completed on 2015-01-12 17:36:58
