Meteor.publish('allStocks', function() {
  return Stocks.find();
});

Meteor.publish('userTransactions', function() {
  return Transactions.find({'userId': this.userId});
});

Meteor.publish('userHoldings', function() {
  var sub = this,
      loading = true;

  var handle = Transactions.find({'userId': sub.userId}).observe({
    added: function(transaction) {
      if (loading)
        return;

      // Check if there is a pre-existing holding for this stock
      var holding = Holdings.findOne({'symbol': transaction.symbol});
      if (holding) {
        // If holding exists update it and publish change
        var fields = updateHolding(holding, transaction);
        Holdings.update(holding._id, {$set: fields});
        sub.changed('holdings', holding._id, fields);
      } else {
        // Else add new holding for this stock and publish new document
        var newHolding = addHolding(sub.userId, transaction);
        var id = Holdings.insert(newHolding);
        sub.added('holdings', id, newHolding);
      }
      updateHoldingValue(sub.userId, transaction.symbol);
      // Meteor.call('refreshHoldings', sub.userId, transaction.symbol, function(error, results) {
      //   if (error)
      //     throw Meteor.Error(500, error.message);
      // });
    }
  });

  loading = false;
  sub.ready();

  sub.onStop(function() {
    handle.stop();
  });

  // Return the Holdings for given user
  return Holdings.find({'userId': sub.userId});
});


var updateHolding = function updateHolding(holding, trade) {
  var fields = {};
  fields.shares        = (trade.type === 'Buy' ? holding.shares + trade.shares : holding.shares - trade.shares);
  fields.totalCost     = (trade.type === 'Buy' ? holding.totalCost - trade.cashFlow : holding.totalCost);
  fields.totalShares   = (trade.type === 'Buy' ? holding.totalShares + trade.shares : holding.totalShares);
  fields.costPerShare  = fields.totalCost / fields.totalShares;
  fields.costBasis     = fields.costPerShare * fields.shares;

  return fields;
};

var addHolding = function addHolding(userId, trade) {
  var holding = {}
  holding.userId        = userId;
  holding.symbol        = trade.symbol;
  holding.shares        = (trade.type === 'Buy' ? trade.shares : -trade.shares)
  holding.totalCost     = (trade.type === 'Buy' ? -trade.cashFlow : 0);
  holding.totalShares   = (trade.type === 'Buy' ? trade.shares : 0);
  holding.costPerShare  = holding.totalCost / holding.totalShares;
  holding.costBasis     = holding.costPerShare * holding.shares;

  return holding;
};