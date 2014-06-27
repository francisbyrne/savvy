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
        var fields = recalculateHolding(holding, transaction);
        Holdings.update(holding._id, {$set: fields});
        _.extend(holding, fields);
        updateHoldingValue(holding);
      } else {
        // Else add new holding for this stock and publish new document
        var newHolding = createHolding(sub.userId, transaction);
        newHolding._id = Holdings.insert(newHolding);
        updateHoldingValue(newHolding);
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
        var fields  = recalculateHolding(holding, transaction, true);
        Holdings.update(holding._id, {$set: fields});
        updateHoldingValue(holding);
      } else {
        Holdings.remove(holding._id);
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

// Whenever a stock is modified, update the holding value
Meteor.publish('watchStocks', function() {
  var sub = this,
      loading = true;

  var handle = Stocks.find().observe({
      added: function(stock) {
        if (loading)
          return;

        updateHoldingsForStock(stock);
      },
      changed: function(stock, oldStock) {
        updateHoldingsForStock(stock);
      }
    });

  loading = false;
  sub.ready();

  sub.onStop(function() {
    handle.stop();
  });
})



// DataTable publication
PortfolioTable = new DataTableComponent({
  subscription: 'holdings',
  collection: Holdings,
  query: function(component) { return { 'userId': this.userId }; }
});

PortfolioTable.publish();

// Calling `_ensureIndex` is necessary in order to sort and filter collections.
// [see mongod docs for more info](http://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/)
Meteor.startup(function(){
  Holdings._ensureIndex({ _id: 1 }, { unique: 1 });
  Holdings._ensureIndex({'symbol': 1});
  Holdings._ensureIndex({'price': 1});
  Holdings._ensureIndex({'change': 1});
  Holdings._ensureIndex({'shares': 1});
  Holdings._ensureIndex({'costBasis': 1});
  Holdings._ensureIndex({'marketValue': 1});
  Holdings._ensureIndex({'daysGain': 1});
  Holdings._ensureIndex({'gain': 1});
});
