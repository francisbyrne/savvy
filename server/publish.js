Meteor.publish('allStocks', function() {
  return Stocks.find({});
});

Meteor.publish('userTransactions', function() {
  return Transactions.find();
});