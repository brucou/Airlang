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
DELETE FROM pg_notepad;
DELETE FROM pg_tsr_word_weight;
DELETE FROM pg_word_user_translation;
----- less than 20 values
-- pg_notepad
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (48, 'reader tool', 'eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'držet', 'držet', ' V Rusku vypukla kvůli rublu panika, mluví se o pádu vlády - iDNES.cz Rusové by měli držet své úspory ve stejné měně, v jaké je měli na účtech dříve. Po naléhavě svolané schůzi ruské vlády to', 17);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (49, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'schůzi', 'schůze', 'iDNES.cz Rusové by měli držet své úspory ve stejné měně, v jaké je měli na účtech dříve. Po naléhavě svolané schůzi ruské vlády to občanům Ruské federace vzkázal ministr hospodářského rozvoje Alexej Uljukajev. Na otázku novinářů, v jaké měně by', 33);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (50, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'dostala', 'dostat', 'své úspory v nynější kritické situaci mít, odpověděl ministr stručně: „Ve stejné jako dosud.“ Ruská měna se v posledních dnech dostala do kritické situace, když se propadla na hranici 80 rublů k dolaru a od začátku roku ztratila víc než', 76);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (51, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'hranici', 'hranice', 'ministr stručně: „Ve stejné jako dosud.“ Ruská měna se v posledních dnech dostala do kritické situace, když se propadla na hranici 80 rublů k dolaru a od začátku roku ztratila víc než polovinu své hodnoty. Premiér Dmitrij Medveděv v úterý', 84);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (52, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'soubor', 'opatření', 'než polovinu své hodnoty. Premiér Dmitrij Medveděv v úterý svolal naléhavou vládní schůzi, na níž podle úřední zprávy „ministři vypracovali soubor opatření, které by měla přispět ke stabilizaci situace“. Podle Uljukajeva je situace „velmi složitá“. Šéf Kremlu Vladimir Putin zatím', 115);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (53, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'vypracovali', 'soubor', 'víc než polovinu své hodnoty. Premiér Dmitrij Medveděv v úterý svolal naléhavou vládní schůzi, na níž podle úřední zprávy „ministři vypracovali soubor opatření, které by měla přispět ke stabilizaci situace“. Podle Uljukajeva je situace „velmi složitá“. Šéf Kremlu Vladimir Putin', 114);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (54, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'měla', 'přispět', 'Premiér Dmitrij Medveděv v úterý svolal naléhavou vládní schůzi, na níž podle úřední zprávy „ministři vypracovali soubor opatření, které by měla přispět ke stabilizaci situace“. Podle Uljukajeva je situace „velmi složitá“. Šéf Kremlu Vladimir Putin zatím mlčí. Jeho mluvčí Dmitrij', 119);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (55, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'velmi', 'složitý', 'na níž podle úřední zprávy „ministři vypracovali soubor opatření, které by měla přispět ke stabilizaci situace“. Podle Uljukajeva je situace „velmi složitá“. Šéf Kremlu Vladimir Putin zatím mlčí. Jeho mluvčí Dmitrij Peskov agentuře RIA Novosti řekl, že prezident je v', 128);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (56, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'žádná', 'mimořádný', 'Vladimir Putin zatím mlčí. Jeho mluvčí Dmitrij Peskov agentuře RIA Novosti řekl, že prezident je v kontaktu s vládou, ale „žádná mimořádná zasedání zatím neplánuje“. Rusové skupují klenoty i západní auta Ruská média a sociální sítě jsou plné spekulací o', 152);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (57, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'mimořádná', 'zasedání', 'Putin zatím mlčí. Jeho mluvčí Dmitrij Peskov agentuře RIA Novosti řekl, že prezident je v kontaktu s vládou, ale „žádná mimořádná zasedání zatím neplánuje“. Rusové skupují klenoty i západní auta Ruská média a sociální sítě jsou plné spekulací o omezení', 153);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (58, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'tvoří', 'fronta', 'Ruska zásoby dolarů a eur došly. Problémy jsou v Kazani, Nižním Novgorodu nebo Permu, v řadě měst se před směnárnami tvoří fronty. Prudce rovněž roste poptávka po cennostech, elektronice a západních autech. Rusové vymění rubly za dolary a nacpou je', 203);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (59, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'Prudce', 'rovněž', 'dolarů a eur došly. Problémy jsou v Kazani, Nižním Novgorodu nebo Permu, v řadě měst se před směnárnami tvoří fronty. Prudce rovněž roste poptávka po cennostech, elektronice a západních autech. Rusové vymění rubly za dolary a nacpou je do matrací,', 205);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (60, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'fyzickým', 'poskytovat', 'matrací, míní ekonom Vedení největší ruské banky Sberbank dementovalo informace o tom, že bankovní dům s platností od úterka přestal fyzickým osobám poskytovat půjčky. Pod vlivem spekulací se ale akcie Sberbanku podle agentury Interfax propadly až o 17 procent. Podle', 244);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (61, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'půjčky', 'vliv', 'Vedení největší ruské banky Sberbank dementovalo informace o tom, že bankovní dům s platností od úterka přestal fyzickým osobám poskytovat půjčky. Pod vlivem spekulací se ale akcie Sberbanku podle agentury Interfax propadly až o 17 procent. Podle ruských médií se', 247);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (62, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'médií', 'země', 'osobám poskytovat půjčky. Pod vlivem spekulací se ale akcie Sberbanku podle agentury Interfax propadly až o 17 procent. Podle ruských médií se země dostává do horší situace než v krizovém roce 2008 i v roce 1998, kdy se Rusko potácelo', 265);
INSERT INTO pg_notepad (note_id, module, first_language, target_language, user_id, url, word, lemma, context_sentence, index) VALUES (63, 'reader tool','eng','cze', 1, 'http://ekonomika.idnes.cz/v-rusku-vypukla-kvuli-propadu-rublu-panika-dosly-dolary-i-eura-pve-/eko-zahranicni.aspx?c=A141216_183624_eko-zahranicni_ozr', 'bychom', 'představit', 'uchýlil k burzovním piruetám, které byly do dnešních dnů nemyslitelné,“ komentoval situaci list Moskovskij komsomolec. „To, co se děje nyní, bychom si nepředstavili ani v nejděsivějším snu,“ řekl serveru Newsru místoředitel centrální banky Sergej Švecov. Omezují se i celebrity, za', 310);
-- pg_tsr_word_weight
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (152,'eng','cze',1, 'držet', 27, '2014-12-17T02:27:29.258+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (153,'eng','cze', 1, 'schůze', 27, '2014-12-17T02:28:25.210+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (154,'eng','cze', 1, 'dostat', 27, '2014-12-17T02:31:29.530+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (155,'eng','cze', 1, 'hranice', 27, '2014-12-17T02:31:58.333+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (156,'eng','cze', 1, 'opatření', 27, '2014-12-17T02:33:26.834+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (157,'eng','cze', 1, 'soubor', 27, '2014-12-17T02:33:41.434+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (158,'eng','cze', 1, 'přispět', 27, '2014-12-17T02:34:31.451+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (159,'eng','cze', 1, 'složitý', 27, '2014-12-17T02:35:17.735+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (160,'eng','cze', 1, 'mimořádný', 27, '2014-12-17T02:36:11.410+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (161,'eng','cze', 1, 'zasedání', 27, '2014-12-17T02:36:56.239+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (163,'eng','cze', 1, 'rovněž', 27, '2014-12-17T02:40:06.434+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (164,'eng','cze', 1, 'poskytovat', 27, '2014-12-17T02:42:07.127+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (165,'eng','cze', 1, 'vliv', 27, '2014-12-17T02:43:21.139+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (166,'eng','cze', 1, 'země', 27, '2014-12-17T02:45:28.979+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (167,'eng','cze', 1, 'představit', 27, '2014-12-17T02:50:54.560+01:00', 1, 1, 0);
INSERT INTO pg_tsr_word_weight (id, first_language, target_language, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (162,'eng','cze', 1, 'fronta', 27, '2014-12-17T01:52:49.856Z', 1, NULL, 1);
-- pg_word_user_translation
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (4, 1, 'eng', 'cze', 'držet', 'držet', NULL, 'hold', 'She holds her child''s hand when they cross the street.', 'Držela ( or: podržela) ji za ruku, když přecházely přes ulici.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (5, 1, 'eng', 'cze', 'schůzi', 'schůze', NULL, 'meeting', 'The community meeting lasted for two hours.', 'Schůze ( or: schůzka) trvala dvě hodiny.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (6, 1, 'eng', 'cze', 'dostala', 'dostat', NULL, 'get', 'He got the flu and had to stay at home.', 'Dostal chřipku a musel zůstat doma.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (7, 1, 'eng', 'cze', 'hranici', 'hranice', NULL, 'border', 'The border between the two countries was marked by a fence.', 'Hranice mezi těmi dvěma státy byla obehnána plotem.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (8, 1, 'eng', 'cze', 'soubor', 'opatření', NULL, 'measure', 'The measure was approved by the legislature.', 'Opatření bylo schváleno parlamentem.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (9, 1, 'eng', 'cze', 'vypracovali', 'soubor', NULL, 'collection', 'She has a rock collection.', 'Má sbírku kamenů.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (10, 1, 'eng', 'cze', 'měla', 'přispět', NULL, 'contribute', NULL, NULL);
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (11, 1, 'eng', 'cze', 'velmi', 'složitý', NULL, 'involved', 'It was an involved process, so he hired a professional to do it.', 'Byl to složitý ( or: komplikovaný) proces, a tak si na to najal odborníka.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (12, 1, 'eng', 'cze', 'žádná', 'mimořádný', NULL, 'extra', 'She received extra pay for the extra hours that she worked.', 'Dostala zaplaceno navíc za mimořádné hodiny, které odpracovala.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (13, 1, 'eng', 'cze', 'mimořádná', 'zasedání', NULL, 'meeting', NULL, NULL);
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (14, 1, 'eng', 'cze', 'tvoří', 'fronta', NULL, 'queue', '', '');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (15, 1, 'eng', 'cze', 'Prudce', 'rovněž', NULL, 'as well', NULL, NULL);
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (16, 1, 'eng', 'cze', 'fyzickým', 'poskytovat', NULL, 'provide', 'I''ll provide the tent if you provide the food.', 'Tato pec poskytuje teplo celému domu.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (17, 1, 'eng', 'cze', 'půjčky', 'vliv', NULL, 'influence', 'She has a lot of influence over his thinking.', 'Má velký vliv na jeho myšlení.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (18, 1, 'eng', 'cze', 'médií', 'země', NULL, 'country', 'The leaders of this country work very hard.', 'Vedoucí představitelé tohoto státu ( or: této země) pracují velmi tvrdě.');
INSERT INTO pg_word_user_translation (id, user_id, first_language, target_language, word, lemma, morph_info, lemma_translation, sample_sentence_first_lg, sample_sentence_target_lg) VALUES (19, 1, 'eng', 'cze', 'bychom', 'představit', NULL, 'present', 'Governor, may I present to you Mr Johnson?', 'Pane guvernére, mohu vám představit pana Johnsona?');

-- something else : create a loading animation
function(){
var p=document.createElement("p");
p.innerHTML="<strong>Loading…</strong>";
p.id="loadingp";p.style.padding="20px";p.style.background="#fff";p.style.left="20px";p.style.top=0;p.style.position="fixed";p.style.zIndex="9999999";p.style.opacity=".85";document.body.appendChild(p);
document.body.appendChild(document.createElement("script")).src="https://gist.github.com/ttscoff/6109434/raw/Bullseye.js?x="+(Math.random());})();
