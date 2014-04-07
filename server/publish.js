Meteor.publish('userHoldings', function() {
  var holdings = Holdings.find({userId: this.userId});
  var stockIds = holdingsToStockIds(holdings.fetch());
  // Meteor.call('refreshStockDetails', { symbols: portfolio.stockIds(this.userId) } );
  return holdings;
});

// Meteor.startup(function() {
//   Holdings.insert({userId: Meteor.userId(), stockId: "yhoo"});
//   Holdings.insert({userId: Meteor.userId(), stockId: "goog"});
// });

Meteor.publish('allStocks', function() {
  return Stocks.find({});
});