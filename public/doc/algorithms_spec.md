# Reader tool

## TSR functionality (time-spaced repetition)
### Specification
Scenario 1: The reader tool is active, the user selects a text to study, the text is displayed and words being learnt 
are displayed with a distinctive visual appearance.  

f :: html_text -> highlighted_text
TODO: change the structure of the highlighting to first get a [paragraph] out of the html_text 
and then seek to apply the filters
Then that paragraph structure has to be passed to the controller, so when the user highlight a word, it can construct 
the pos structure.
That also means there needs to be a user database, in which there is data about page visited with the reader tool,
the paragraph associated (pas besoin de le cacher à priori - attention si la page change et le texte change aussi, 
toutes les positions seraient mauvaises... Ex. Revision d'article!) and the position of the highlighted words 
(state). That said, if we know which token was selected, we can find it back and update the pos...
Rewrite html_text -> highlighted_text to apply filter on the whole text_document

### Functions
f :: html_text -> [paragraph]
Typedef text_document === [paragraph]
Typedef paragraph = {[token], other relevant paragraph data}
Typedef note = [{token, pos}]
Typedef pos = {local_pos, global_pos}
              : local_pos is local to a paragraph (for example)
              : global_pos is global to a [paragraph]

#### Helper functions
Typedef text = [word] 
Typedef word = one or a sequence of characters
Typedef html_text = sequence of html content (for example a webpage)
Typedef html_partext = sequence of a subset of html content (text, p tags, span tags, and br tags for now)

##### Lemmatization functions
Lemmatizer :: word -> lemma
  -- lemmatize a word.
  -- Example : neříkáme -> říkát
Delemmatizer :: lemma -> [word]
  -- returns the series of word to which correspond a given lemma
  -- Example : říkát -> [neříkáme, říkáme, říkám, říkáš, etc.] 
Tokenizer :: text -> [token]
  -- tokenizer function which transform a text into a series of token which serve as atomic unit of analysis for
     certain functions.
     A simple tokenizer splits a text into words at each space. A more complex tokenizer can take a text and return
     a series of token which represent the PoS (Part of Speech) of each word or expression in the text.

##### Location functions
get_token :: text_document, pos -> token
get_token :: paragraph, pos -> token

### User interface


