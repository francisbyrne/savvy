// Calculates the current holdings for a user based on their transactions and the current market price of the stocks
calculateHoldings = function calculateHoldings() {
  
  // First instantiate an empty holdings object and get all transactions for given user
  var holdings = {};
  var transactions = Transactions.find({userId: Meteor.userId()}).fetch();

  // Filter out future transactions
  transactions = _.filter(transactions, function(transaction) {
    var date = moment(transaction.date);
    return ( moment().diff(date, 'days') >= 0 );
  });

  // Group by symbol
  var transBySymbols = _.groupBy(transactions, function(transaction) {
    return transaction.symbol;
  });

  var symbols = _.keys(transBySymbols);

  // Get an array of all relevant stocks, indexed by symbol
  var stocks = _.indexBy( 
    Stocks.find({'symbol': { $in: symbols } }).fetch() , 
    function(stock) { return stock.symbol; } 
  );

  var holdings = _.map(transBySymbols, function(tradeArray) {
    var holding = {};
    var symbol = tradeArray[0].symbol;
    // Save "Buys" array for Cost Per Share calculation
    var buys = _.filter(tradeArray, function(trade) {return trade.type === 'Buy';});
    // Total Cost of all bought shares
    var totalCost       = _.reduce(buys, function(memo, trade) {return memo - trade.cashFlow;}, 0);
    // Total Number of all bought shares
    var totalShares     = _.reduce(buys, function(memo, trade) {return memo + trade.shares;}, 0);
    var costPerShare    = totalShares && (totalCost / totalShares) || 0;

    // Add stock details
    _.extend( holding, stocks[tradeArray[0].symbol] );

    // Make number of shares for all "Sells" negative
    _.map(tradeArray, function(trade) {
      (trade.type === 'Sell') && (trade.shares = -trade.shares);
      return trade;
    });

    holding.shares      = _.reduce(tradeArray, function(memo, trade) {return memo + trade.shares}, 0);
    holding.costBasis   = holding.shares * costPerShare;
    holding.marketValue = holding.shares * holding.lastTradePriceOnly;
    holding.gain        = holding.marketValue - holding.costBasis;
    holding.gainPercent = holding.gain / holding.costBasis || 0;
    holding.daysGain    = holding.shares * holding.change;
    // Overall Gain is the net gain of all trades plus the current market value, divided by the total cost of all bought shares
    holding.overallGain = (_.reduce(tradeArray, function(memo, trade) {return memo + trade.cashFlow;}, 0) + holding.marketValue) / totalCost;

    return holding;
  });

  // TODO: move this to view layer
  // Format fields accordingly
  _.each(holdings, function(holding) {
    holding.shares      = holding.shares ? holding.shares : '0 (Closed)';
    holding.marketValue = numeral(holding.marketValue).format();
    holding.costBasis   = numeral(holding.costBasis).format(); // Cost Basis is +ve when Cash Flow is -ve
    holding.gain        = numeral(holding.gain).format();
    holding.gainPercent = numeral(holding.gainPercent).format('0.00%');
    holding.daysGain    = numeral(holding.daysGain).format();
    holding.overallGain = numeral(holding.overallGain).format('0.00%');
  });
  
  return {'currentHoldings': holdings || [] };
};