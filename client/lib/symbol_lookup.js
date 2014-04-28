// constructs the suggestion engine
symbols = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  prefetch: {
    // url points to a json file that contains an array of country names, see
    // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
    url: 'symbols-asx.json'
  }
});
 
// kicks off the loading/processing of `local` and `prefetch`
Meteor.startup(function() {
  symbols.initialize();
})