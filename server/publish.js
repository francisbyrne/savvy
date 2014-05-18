Meteor.publish('allStocks', function() {
  return Stocks.find();
});

Meteor.publish('userTransactions', function() {
  return Transactions.find({'userId': this.userId});
});

Meteor.publish('userHoldings', function() {
  // Return the Holdings for given user
  return Holdings.find({'userId': this.userId});
});

DataTable.publish('holdings', Holdings);


// Whenever a trade is added, removed or changed, 
// update the holdings for that stock for the subscribed user
Meteor.publish('watchTransactions', function() {
  var sub = this,
      loading = true;

  var handle = Transactions.find({'userId': sub.userId}).observe({
    
    // When trade is added, update holdings to reflect new holding size, 
    // or add it if it's the first trade
    added: function(transaction) {
      if (loading)
        return;

      // Check if there is a pre-existing holding for this stock
      var holding = Holdings.findOne({'symbol': transaction.symbol, 'userId': transaction.userId});
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
    },

    // TODO: changed

    // When trades are removed, update the holdings to remove the trade values
    // and if there are no more trades, remove the holding
    removed: function(transaction) {
      var tradesExist = Transactions.find({'userId': transaction.userId, 'symbol': transaction.symbol}).fetch().length > 0;
      var holding = Holdings.findOne({'symbol': transaction.symbol, 'userId': transaction.userId});

      // In case using Clear All, where all transactions are removed simultaneously, just ignore all subsequent trade removals
      if (! holding)
        return;

      // Check if this is the last transaction to remove and if so, remove the holding completely
      if ( tradesExist ) {
        var fields  = updateHolding(holding, transaction, true);
        Holdings.update(holding._id, {$set: fields});
        sub.changed('holdings', holding._id, fields);
      } else {
        Holdings.remove(holding._id);
        sub.removed('holdings', holding._id);
      }
    }
  });

  loading = false;
  sub.ready();

  sub.onStop(function() {
    handle.stop();
  });
});

// Whenever a holding is added, pull latest stock price in order to recalculate
Meteor.publish('watchHoldings', function() {
  var sub = this,
      loading = true;

  var handle = Holdings.find({'userId': sub.userId}).observe({
    
    added: function(holding) {
      if (loading)
        return;

      // Update holding value (should probably be in watchTransactions but easier to do it here)
      var stock = Stocks.findOne({'symbol': holding.symbol});
      if (stock.lastTrade) {
        var fields = updateHoldingValue(holding, stock);
        Holdings.update(holding._id, {$set: fields});
      }

      // Now pull latest stock prices
      refreshHeldStocks(sub.userId, holding.symbol);
    }
  });

  loading = false;
  sub.ready();

  sub.onStop(function() {
    handle.stop();
  });
});