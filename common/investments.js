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

  // TODO: handle non-existent stocks (display error message and don't add stock)
  // takes a stock symbol, refreshes the stock details and adds a holding for the given user (or current user if blank)
  'addHolding': function(stockId, userId) {
    var userId = userId || this.userId;
    check(stockId, String);
    check(userId, String);
    var holding = {userId: userId, stockId: stockId};
    if ( Stocks.findOne({symbol: stockId}) )
      var holdingId = Holdings.insert(holding);
    if (Meteor.isServer) {
      Meteor.call('refreshStockDetails', {symbols: [stockId], fields: ['s', 'n', 'l1', 'c1', 'm', 'k', 'v', 'a2', 'j1', 'r', 'y', 'e', 'e1']}, function(error, result) {
        if (error) 
          console.log(error.message);
        else
          holdingId ? '' : Holdings.insert(holding);
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