// Calculates the current holdings for a user based on their transactions and the current market price of the stocks
calculateHoldings = function calculateHoldings() {
  
  // First instantiate an empty holdings object and get all transactions for given user
  var holdings = {};
  var transactions = Transactions.find({userId: Meteor.userId()}).fetch();
  var symbols = _.uniq( transactions.map(function(transaction) {
    return transaction.symbol;
  }) );

  // Get an array of all relevant stocks, indexed by symbol
  var stocks = _.indexBy( 
    Stocks.find({'symbol': { $in: symbols } }).fetch() , 
    function(stock) { return stock.symbol; } 
  );

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

    // Merge holding with stock (price etc.)
    holding = _.extend( holding, stocks[transaction.symbol] );

    // Add price-dependent fields
    holding.marketValue = holding.shares * holding.lastTradePriceOnly || 0;
    holding.costBasis   = -holding.cashFlow;
    holding.gain        = holding.marketValue + holding.cashFlow;
    holding.gainPercent = holding.gain / holding.costBasis || 0;
    holding.daysGain    = holding.change * holding.shares || 0;

    // Add to holdings object
    holdings[transaction.symbol] = holding;
  });

  // Object to array (#each doesn't take objects)
  holdings = _.toArray(holdings);

  // Format fields accordingly
  _.each(holdings, function(holding) {
    holding.marketValue = numeral(holding.marketValue).format();
    holding.costBasis   = numeral(holding.costBasis).format(); // Cost Basis is +ve when Cash Flow is -ve
    holding.gain        = numeral(holding.gain).format();
    holding.gainPercent = numeral(holding.gainPercent).format('0.00%');
    holding.daysGain    = numeral(holding.daysGain).format();
  });
  
  return {'currentHoldings': holdings || [] };
};