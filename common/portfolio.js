Stocks = new Meteor.Collection('stocks');

/**
 *  holding = { _id, userId, stockId };
 */
Holdings = new Meteor.Collection('holdings');

holdingsToStockIds = function(holdings) {
  var stocks = _.map(holdings, function(holding) {
    return holding && holding.stockId;
  });
  return stocks;
};

Meteor.methods({

  // takes a stock symbol, refreshes the stock details and adds a holding for the given user (or current user if blank)
  'addHolding': function(stockId, userId) {

    // get current user if not specified
    var userId = userId || this.userId;
    check(stockId, String);
    if( ! Match.test(userId, String) ) {
      if (Errors)
        Errors.throw('User ID invalid or non-existent. Please login to add holdings.');
    }

    // if stock exists, just add it on the client
    var holding = {userId: userId, stockId: stockId};
    if ( Stocks.findOne({symbol: stockId}) )
      var holdingId = Holdings.insert(holding);

    // update the stock details on the server and add the stock if it doesn't already exist
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

  // takes a stock symbol, remove the given user (or current user if blank)
  'removeHolding': function(holdingId) {
    check(holdingId, String);
    if (Meteor.isServer) {
      Holdings.remove(holdingId);
    }
  }

})