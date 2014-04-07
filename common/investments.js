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