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
--DELETE FROM pg_notepad;
DELETE FROM pg_tsr_word_weight;
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (29,1,'společností',27,'2014-12-11T01:08:03.540+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (30,1,'materiálu',27,'2014-12-11T01:08:09.565+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (31,1,'uvádí',27,'2014-12-11T01:08:11.326+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (32,1,'takzvaný',27,'2014-12-11T01:08:21.208+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (33,1,'nemyslitelné',27,'2014-12-11T01:09:31.053+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (34,1,'naprosto',27,'2014-12-11T01:09:35.436+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (35,1,'vzdali',27,'2014-12-11T01:09:39.674+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (36,1,'postupně',27,'2014-12-11T01:09:46.540+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (37,1,'jedinečného',27,'2014-12-11T01:10:09.988+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (38,1,'zásadní',27,'2014-12-11T01:10:15.586+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (39,1,'tisku',27,'2014-12-11T01:10:25.614+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (40,1,'mínění',27,'2014-12-11T01:10:29.345+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (41,1,'přispívat',27,'2014-12-11T01:10:33.672+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (42,1,'utváření',27,'2014-12-11T01:10:36.798+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (43,1,'programátoři',27,'2014-12-11T01:11:50.636+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (44,1,'převzít',27,'2014-12-11T01:11:55.442+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (45,1,'Vydavatelé',27,'2014-12-11T01:11:59.330+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (46,1,'překladatelé',27,'2014-12-11T01:12:05.905+01:00',1,1,0);
--- newer, remove the one before if still there
-- ACHTUNG : necessary to add 1 as exercise_type, or change it in the program
DELETE FROM pg_notepad;
DELETE FROM pg_tsr_word_weight;
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (136,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','firma','- iDNES.cz Shaangu získá v rámci dohody ''letter of intent'', která vymezuje obsah budoucí smlouvy, exkluzivitu pro jednání s českou firmou na dobu 120 dní, uvádí se v materiálu zveřejněném čínskou společností. Shaangu v té době uskuteční v české firmě',30);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (137,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','dohoda',' Číňané koupí brněnského výrobce turbín Ekol, zaplatí 1,3 miliardy - iDNES.cz Shaangu získá v rámci dohody ''letter of intent'', která vymezuje obsah budoucí smlouvy, exkluzivitu pro jednání s českou firmou na dobu 120 dní, uvádí',16);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (138,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','získat',' Číňané koupí brněnského výrobce turbín Ekol, zaplatí 1,3 miliardy - iDNES.cz Shaangu získá v rámci dohody ''letter of intent'', která vymezuje obsah budoucí smlouvy, exkluzivitu pro jednání s českou firmou na dobu',13);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (139,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','podat','Shaangu v té době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný ''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské',62);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (140,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','nabídka','době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný ''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, (...)',65);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (141,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','zařízení','procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české v (...)',89);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (142,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','rozhodnout','čínskou společností. Shaangu v té době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný ''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je',60);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (143,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','vyrábět','Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost E (...)',84);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (144,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','skupina','Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české výrobce turbin, její tržby předloni dosáhly 1,5 m (...)',97);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (145,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','dosáhnout','energetiku a průmysl. Firma je součástí skupiny Shaanxi Blower. Společnost Ekol patří mezi přední české výrobce turbin, její tržby předloni dosáhly 1,5 miliardy Kč. Podstatná část její produkce míří na vývoz. Ekol vlastní 51 procent ve firmě EKOL TURBO, a. (...)',111);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (146,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','prověrka','na dobu 120 dní, uvádí se v materiálu zveřejněném čínskou společností. Shaangu v té době uskuteční v české firmě hloubkovou prověrku finančního stavu, takzvaný ''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích',51);
INSERT INTO pg_notepad(note_id, module,  user_id,  url,  word,  context_sentence,  index) VALUES (147,'reader tool',1,'http://ekonomika.idnes.cz/shaangu-koupe-ekol-0no-/ekonomika.aspx?c=A140704_215639_ekonomika_maq','sídlo','''due diligence'', a poté se rozhodne, zda podá na Ekol nabídku na převzetí 100 procent jejích akcií. Shaangu Power se sídlem v Si-anu, což je metropole středočínské province Šen-si, vyrábí kompresory, turbiny a další zařízení pro energetiku a průmysl. Firma',75);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (112,1,'firma',27,'2014-12-14T05:47:07.863+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (113,1,'dohoda',27,'2014-12-14T05:47:17.145+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (114,1,'získat',27,'2014-12-14T05:47:27.998+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (115,1,'podat',27,'2014-12-14T05:48:12.204+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (116,1,'nabídka',27,'2014-12-14T05:48:23.803+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (117,1,'zařízení',27,'2014-12-14T05:48:37.774+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (118,1,'rozhodnout',27,'2014-12-14T05:54:23.548+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (119,1,'vyrábět',27,'2014-12-14T05:56:11.404+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (120,1,'skupina',27,'2014-12-14T05:58:35.378+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (121,1,'dosáhnout',27,'2014-12-14T05:59:39.590+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (122,1,'prověrka',27,'2014-12-14T06:02:31.025+01:00',1,1,0);
INSERT INTO pg_tsr_word_weight(id, user_id, word, box_weight, last_revision_time, last_revision_easyness, last_revision_exercise_type, last_revision_grade) VALUES (123,1,'sídlo',27,'2014-12-14T06:06:02.453+01:00',1,1,0);

function(){
var p=document.createElement("p");
p.innerHTML="<strong>Loading…</strong>";
p.id="loadingp";p.style.padding="20px";p.style.background="#fff";p.style.left="20px";p.style.top=0;p.style.position="fixed";p.style.zIndex="9999999";p.style.opacity=".85";document.body.appendChild(p);
document.body.appendChild(document.createElement("script")).src="https://gist.github.com/ttscoff/6109434/raw/Bullseye.js?x="+(Math.random());})();
