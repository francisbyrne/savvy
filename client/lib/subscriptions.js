Meteor.startup(function() {
  Meteor.subscribe('allStocks');
  Meteor.subscribe('watchTransactions');
  Meteor.subscribe('watchStocks');
  Meteor.subscribe('watchHoldings');
});

// Whenever a stock is updated, recalculate holdings for current user
Meteor.startup(function(){
  Deps.autorun(function() {
    var symbols = Holdings.find().map(function(holding) {return holding.symbol});
    symbols = _.uniq(symbols);

    Stocks.find({'symbol': {$in: symbols} }).observe({
      added: function(stock) {
        updateHoldingsForStock(stock);
      },
      changed: function(stock, oldStock) {
        updateHoldingsForStock(stock);
      }
    });
  });
});