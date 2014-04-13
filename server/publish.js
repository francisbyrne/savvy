Meteor.publish('userHoldings', function() {
  var holdings = Holdings.find({userId: this.userId});
  var stockIds = holdingsToStockIds(holdings.fetch());
  // Meteor.call('refreshStockDetails', { symbols: portfolio.stockIds(this.userId) } );
  return holdings;
});

Meteor.publish('allStocks', function() {
  return Stocks.find({});
});

Meteor.publish('userTransactions', function() {
  return Transactions.find();
});