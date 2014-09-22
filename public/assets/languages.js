/**
 * Created by bcouriol on 26/08/14.
 */
function getLangDirection(language) {
   var direction;
   TransOverLanguages.forEach(function(lang_array) {
      if (language == lang_array[0]) {
         direction = lang_array[2]; // TODO change TransOverLanguages from array to object
      }
   });
   return direction;
}

TransOverLanguages = [
   ['af', 'Afrikaans', 'ltr'],
   ['sq', 'Albanian', 'ltr'],
   ['ar', 'Arabic', 'rtl'],
   ['hy', 'Armenian', 'ltr'],
   ['az', 'Azerbaijani', 'ltr'],
   ['eu', 'Basque', 'ltr'],
   ['be', 'Belarusian', 'ltr'],
   ['bn', 'Bengali', 'ltr'],
   ['bg', 'Bulgarian', 'ltr'],
   ['ca', 'Catalan', 'ltr'],
   ['zh-CN', 'Chinese (Simplified)', 'ltr'],
   ['zh-TW', 'Chinese (Traditional)', 'ltr'],
   ['hr', 'Croatian', 'ltr'],
   ['cs', 'Czech', 'ltr'],
   ['da', 'Danish', 'ltr'],
   ['nl', 'Dutch', 'ltr'],
   ['en', 'English', 'ltr'],
   ['eo', 'Esperanto', 'ltr'],
   ['et', 'Estonian', 'ltr'],
   ['tl', 'Filipino', 'ltr'],
   ['fi', 'Finnish', 'ltr'],
   ['fr', 'French', 'ltr'],
   ['gl', 'Galician', 'ltr'],
   ['ka', 'Georgian', 'ltr'],
   ['de', 'German', 'ltr'],
   ['el', 'Greek', 'ltr'],
   ['gu', 'Gujarati', 'ltr'],
   ['ht', 'Haitian (Creole)', 'ltr'],
   ['iw', 'Hebrew', 'rtl'],
   ['hi', 'Hindi', 'ltr'],
   ['hu', 'Hungarian', 'ltr'],
   ['is', 'Icelandic', 'ltr'],
   ['id', 'Indonesian', 'ltr'],
   ['ga', 'Irish', 'ltr'],
   ['it', 'Italian', 'ltr'],
   ['ja', 'Japanese', 'ltr'],
   ['kn', 'Kannada', 'ltr'],
   ['ko', 'Korean', 'ltr'],
   ['la', 'Latin', 'ltr'],
   ['lv', 'Latvian', 'ltr'],
   ['lt', 'Lithuanian', 'ltr'],
   ['mk', 'Macedonian', 'ltr'],
   ['ms', 'Malay', 'ltr'],
   ['mt', 'Maltese', 'ltr'],
   ['no', 'Norwegian', 'ltr'],
   ['fa', 'Persian', 'rtl'],
   ['pl', 'Polish', 'ltr'],
   ['pt', 'Portuguese', 'ltr'],
   ['ro', 'Romanian', 'ltr'],
   ['ru', 'Russian', 'ltr'],
   ['sr', 'Serbian', 'ltr'],
   ['sk', 'Slovak', 'ltr'],
   ['sl', 'Slovenian', 'ltr'],
   ['es', 'Spanish', 'ltr'],
   ['sw', 'Swahili', 'ltr'],
   ['sv', 'Swedish', 'ltr'],
   ['ta', 'Tamil', 'ltr'],
   ['te', 'Telugu', 'ltr'],
   ['th', 'Thai', 'ltr'],
   ['tr', 'Turkish', 'ltr'],
   ['uk', 'Ukrainian', 'ltr'],
   ['ur', 'Urdu', 'rtl'],
   ['vi', 'Vietnamese', 'ltr'],
   ['cy', 'Welsh', 'ltr'],
   ['yi', 'Yiddish', 'rtl']
];

