Template.stock_search.events({
  'submit form#search-form': function(event, template) {
    event.preventDefault();

    var stockId = $( '#search' ).val();

    // route to the stock detail for the inputted ticker
    Router.go('stock_detail', {_id: stockId });
  }
});