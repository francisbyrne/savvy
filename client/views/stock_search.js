
Template.stock_search.rendered = function(){
    // initialize typeahead for search
    Meteor.typeahead(this.$('.search'));
};

Template.stock_search.search = function(){
  // map symbols to array for typeahead datasource
  return Stocks.find().fetch().map(function(it){ return it.symbol; });
};

Template.stock_search.events({
  'submit form#stock-search': function(event, template) {
    event.preventDefault();
    var stockId = template.$( '.search.tt-input' ).val();
    stockId = ( typeof stockId === 'string' && stockId.toUpperCase() );

    // route to the stock detail for the inputted ticker
    Router.go('stock_detail', {_id: stockId });
  }
});