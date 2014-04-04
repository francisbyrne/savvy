Template.stock_search.events({
  'submit form#search-form': function(event, template) {
    event.preventDefault();
    // route to the stock detail for the inputted ticker
    Router.go('stock_detail', {_id: $( '#search' ).val() });
  }
})