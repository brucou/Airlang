/**
 * Created by bcouriol on 28/08/14.
 */
define([], function () {
   var RV = {};
   var tpl = [];
   tpl.push("<table id='table_tooltip' data-content='translation_table'>");
   tpl.push("<thead>");
   tpl.push("<tr>");
   tpl.push("<th colspan='3'>{{translation_lemma}}</th>");
   tpl.push("</tr>");
   tpl.push("</thead>");
   tpl.push("<tbody>");

   tpl.push("{{#result_rows}}");
   tpl.push("<tr class='airlang-rdt-tt-row-translation' data-content='translation' data-lemma='{{lemma}}'>");
   tpl.push("<td class='airlang-rdt-tt-col-tsense'> {{translation_sense}} </td>");
   tpl.push("<td class='airlang-rdt-tt-col-lemma'> {{lemma}} </td>");
   tpl.push("<td class='airlang-rdt-tt-col-sense'> {{sense}} </td>");
   tpl.push("</tr>");
   tpl.push("<tr class='airlang-rdt-tt-row-example' data-content='sample_sentences'>");
   tpl.push("<td colspan='3' class='airlang-rdt-tt-sample_sentence_from' " +
            "data-content-sentence-first-lg='{{example_sentence_from}}' " +
            "data-content-sentence-target-lg='{{example_sentence_to}}'>");
   tpl.push(" {{example_sentence_from}}<br>" +
            "<strong>{{example_sentence_to}}</strong>");
   tpl.push("</td>");
   tpl.push("</tr>");
   tpl.push("{{/result_rows}}");

   tpl.push("</tbody>");
   tpl.push("</table>");
   RV.translation_template = tpl.join("\n");
   //console.log("template", RV.translation_template);
   return RV;
});

