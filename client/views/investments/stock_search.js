Template.stock_search.events({
  'submit form#search-form': function(event, template) {
    event.preventDefault();

    var stockId = $( '#search' ).val();

    // route to the stock detail for the inputted ticker
    Router.go('stock_detail', {_id: stockId });
  }
});

Template.stock_search.rendered = function() {
  this.$('#search').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'symbols',
    displayKey: 'symbol',
    source: symbols.ttAdapter()
  });
}