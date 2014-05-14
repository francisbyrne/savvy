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

  // Get all relevant stock symbols for lookup
  var symbols = _.keys(transBySymbols);

  // Get the stock details from server, see market_data.js for legend of fields
  Meteor.call('refreshStocks', { symbols: symbols }, function(error, results) {
    if (error) {
      Errors.throw(error.reason);
    }
  });

  // Get an array of all relevant stocks, indexed by symbol, for merging with holdings
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
    holding.totalCost       = _.reduce(buys, function(memo, trade) {return memo - trade.cashFlow;}, 0);
    // Total Number of all bought shares
    holding.totalShares     = _.reduce(buys, function(memo, trade) {return memo + trade.shares;}, 0);
    holding.costPerShare    = holding.totalShares && (holding.totalCost / holding.totalShares) || 0;

    // Add stock details
    _.extend( holding, stocks[tradeArray[0].symbol] );

    // Make number of shares for all "Sells" negative
    _.map(tradeArray, function(trade) {
      (trade.type === 'Sell') && (trade.shares = -trade.shares);
      return trade;
    });

    // Calculate holding fields
    holding.shares      = _.reduce(tradeArray, function(memo, trade) {return memo + trade.shares}, 0);
    holding.costBasis   = holding.shares * holding.costPerShare;
    holding.marketValue = holding.shares * holding.lastTrade;
    holding.gain        = holding.marketValue - holding.costBasis;
    holding.gainPercent = holding.gain / holding.costBasis || 0;
    holding.daysGain    = holding.shares * holding.change;
    // Overall Gain is the net gain of all trades plus the current market value, divided by the total cost of all bought shares
    holding.overallGain = _.reduce(tradeArray, function(memo, trade) {return memo + trade.cashFlow;}, 0) + holding.marketValue;
    holding.overallGainPercent = holding.overallGain / holding.totalCost;

    return holding;
  });
  
  // TODO: Add total daily change as percentage
  // Calculate total holdings summary
  var total = {};
  total.marketValue        = _.reduce(holdings, function(memo, holding) {return memo + holding.marketValue;}, 0);
  total.costBasis          = _.reduce(holdings, function(memo, holding) {return memo + holding.costBasis;}, 0);
  total.daysGain           = _.reduce(holdings, function(memo, holding) {return memo + holding.daysGain;}, 0);
  total.gain               = _.reduce(holdings, function(memo, holding) {return memo + holding.gain;}, 0);
  total.gainPercent        = total.gain / total.costBasis;
  total.overallGain        = _.reduce(holdings, function(memo, holding) {return memo + holding.overallGain;}, 0);
  var totalCost            = _.reduce(holdings, function(memo, holding) {return memo + holding.totalCost;}, 0);
  total.overallGainPercent = total.overallGain / totalCost;
  
  return {
    'currentHoldings': holdings || [],
    'total': total || {}
  };
};