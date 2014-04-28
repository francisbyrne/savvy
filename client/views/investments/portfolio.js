Meteor.startup(function() {
  Meteor.subscribe('userHoldings');
});

Template.portfolio.helpers({
  /*
   * Returns the current holdings for a user based on their transactions.
   */
  currentHoldings: function() {

    // First instantiate an empty holdings object and get all transactions for given user
    var holdings = {};
    var transactions = Transactions.find({userId: Meteor.userId()}).fetch();

    // Now add a new holding for each unique transaction, keeping a running tally of Cost Bases and Numbers of Shares 
    _.each(transactions, function(transaction) {

      // Ignore future trade dates
      var date = moment(transaction.date);
      if ( moment().diff(date, 'days') < 0 )
        return;

      // Subtract number of shares held if it is a sell trade
      if (transaction.type == 'Sell')
        transaction.shares = 0 - transaction.shares;

      var holding = holdings[transaction.symbol];
      if ( holding ) {
        // If holding already exists for this stock, update the cost basis and number of shares
        if (transaction.type === 'Sell') {
          // If it's a Sell, reduce the cost basis by the percentage of shares sold
          holding.cashFlow += holding.cashFlow * (transaction.shares / holding.shares);
        } else {
          // If it's a Buy, increase the cost basis by the total trade value
          holding.cashFlow += transaction.cashFlow;
        }
        holding.shares += transaction.shares;
      } else {
        // Otherwise create a new holding for the stock
        holding = transaction;
      }
      holdings[transaction.symbol] = holding;
    });

    // Convert from object into array (Template doesn't handle objects) and add Stock details (price etc.) 
    holdings = _.map(holdings, function(holding) {
      return _.extend( holding, Stocks.findOne({symbol: holding.symbol}) );
    });

    // Add holding-dependent fields and format accordingly
    _.each(holdings, function(holding) {
      var marketValue = holding.shares * holding.lastTradePriceOnly;
      var costBasis   = -holding.cashFlow;
      var gain        = marketValue + holding.cashFlow;
      holding.marketValue = numeral(holding.shares * holding.lastTradePriceOnly).format();
      holding.costBasis   = numeral(costBasis).format() // Cost Basis is +ve when Cash Flow is -ve
      holding.gain        = numeral(gain).format();
      holding.gainPercent = numeral(gain / costBasis).format('0.00%');
      holding.daysGain    = numeral(holding.change * holding.shares).format();
    });
    
    return holdings;
  }
});

var marketValue = function(holding) {

}