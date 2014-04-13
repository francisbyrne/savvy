Stocks = new Meteor.Collection('stocks');

/**
  holding: { 
    _id, 
    userId, 
    stockId,
    numShares,
    price,
  };
 */
Holdings = new Meteor.Collection('holdings');

Transactions = new Meteor.Collection('transactions');

holdingsToStockIds = function(holdings) {
  var stocks = _.map(holdings, function(holding) {
    return holding && holding.stockId;
  });
  return stocks;
};

Meteor.methods({

  // Add a buy/sell transaction for a particular stock
  'addTransaction': function(fields) {
    check(fields, Match.ObjectIncluding({
      symbol: String,
      type: String,
      date: String,
      shares: String,
      price: String,
      commission: Match.Optional(String)
    }) );

    // Get current user if not specified
    var userId = fields.userId || this.userId;
    if( ! Match.test(userId, String) ) {
      if (Errors)
        Errors.throw('User ID invalid or non-existent. Please login to add holdings.');
      else
        return;
    }

    var transaction = {
      // Prevent ticker duplicates via capitals e.g. bhp, BHP
      symbol: fields.symbol.toUpperCase(),
      type: fields.type.toLowerCase(),
      date: moment(fields.date).format('ll'),
      shares: parseInt(fields.shares),
      price: parseInt(fields.price),
      commission: parseInt(fields.commission) || 0,
      userId: userId
    };

    Meteor.call('refreshStockDetails', {symbols: [transaction.symbol], fields: ['s', 'n', 'l1', 'c1', 'm', 'k', 'v', 'a2', 'j1', 'r', 'y', 'e', 'e1']}, function(error, result) {
      if (error) 
        Errors.throw(error.reason);
      // add transaction if not already done on client
      else {
        Transactions.insert(transaction);
      }
    });

  },

  // Takes a stock symbol, refreshes the stock details and adds a holding for the given user (or current user if blank)
  'addHolding': function(fields) {

    Errors ? Errors.clearSeen() : '';

    check(fields.stockId, String);
    var stockId = fields.stockId.toLowerCase();

    // Get current user if not specified
    var userId = fields.userId || this.userId;
    if( ! Match.test(userId, String) ) {
      if (Errors)
        Errors.throw('User ID invalid or non-existent. Please login to add holdings.');
      else
        return;
    }

    // Avoid duplicates
    var holding = {userId: userId, stockId: stockId};
    if ( Holdings.findOne(holding) ) {
      if (Errors)
        Errors.throw('Stock has already been added.');
      else
        return;
    }

    // If stock exists, just add it on the client
    if ( Stocks.findOne({symbol: stockId}) )
      var holdingId = Holdings.insert(holding);

    // Update the stock details on the server and add the stock if it doesn't already exist
    if (Meteor.isServer) {
      Meteor.call('refreshStockDetails', {symbols: [stockId], fields: ['s', 'n', 'l1', 'c1', 'm', 'k', 'v', 'a2', 'j1', 'r', 'y', 'e', 'e1']}, function(error, result) {
        // TODO: get this error message sent to client (DOESNT WORK ATM!)
        if (error) 
          throw new Meteor.Error(error.error, error.reason);
        else
          holdingId ? '' : Holdings.insert(holding); // if holding wasn't already added on client, add it now
      });
    }
  },

  // Takes a stock symbol, remove the given user (or current user if blank)
  'removeHolding': function(holdingId) {
    check(holdingId, String);
    if (Meteor.isServer) {
      Holdings.remove(holdingId);
    }
  }

})