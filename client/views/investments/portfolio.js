Meteor.startup(function() {
  Meteor.subscribe('userHoldings');
});

Template.portfolio.helpers({
  /*
   * This helper returns the current holdings for a user based on their transactions.
   * It tallies 
   */
  currentHoldings: function() {
    var now = moment();
    var holdings = {};
    var transactions = Transactions.find({userId: Meteor.userId()}).map(function(transaction) {
      return _.extend( transaction, Stocks.findOne({id: transaction.symbol}) );
    });
    _.each(transactions, function(transaction) {

      // Ignore future trade dates
      var date = moment(transaction.date);
      if ( now.diff(date, 'days') < 0 )
        return;

      // Subtract number of shares held if it is a sell trade
      if (transaction.type == 'Sell')
        transaction.shares = 0 - transaction.shares;

      var id = transaction.symbol;
      if ( holdings[id] ) {
        holdings[id].shares += transaction.shares;
        holdings[id].costBasis += costBasis(transaction);
      } else {
        holdings[id] = transaction;
        holdings[id].costBasis = costBasis(transaction);
      }
    });

    // Convert from object into array (Template doesn't handle objects)
    return _.map(holdings, function(holding) {
      return _.extend( holding, {
        marketValue: numeral(holding.shares * holding.lastTradePriceOnly).format(),
        costBasis: numeral(holding.costBasis).format()
      });
    });
  }
});

var costBasis = function(transaction) {
  return transaction.shares * transaction.price + transaction.commission;
};