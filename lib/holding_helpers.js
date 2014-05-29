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

updateHolding = function updateHolding(holding, trade, isRemove) {
  // If we're removing the trade, simply make the shares and cashFlow negative 
  // (e.g. so we decrease holding when removing buys)
  if (isRemove) {
    trade.shares    = -trade.shares;
    trade.cashFlow  = -trade.cashFlow;
  }

  var fields = {};
  fields.shares        = (trade.type === 'Buy' ? holding.shares + trade.shares : holding.shares - trade.shares);
  fields.totalCost     = (trade.type === 'Buy' ? holding.totalCost - trade.cashFlow : holding.totalCost);
  fields.totalShares   = (trade.type === 'Buy' ? holding.totalShares + trade.shares : holding.totalShares);
  fields.costPerShare  = (fields.totalShares != 0 ? fields.totalCost / fields.totalShares : 0);
  fields.costBasis     = fields.costPerShare * fields.shares;

  return fields;
};

addHolding = function addHolding(userId, trade) {
  var holding = {
    'userId'        : userId,
    'symbol'        : trade.symbol,
    'shares'        : 0,
    'totalCost'     : 0,
    'totalShares'   : 0
  };
  
  return _.extend( holding, updateHolding(holding, trade) );
};

getUserSymbols = function(userId) {
  // Allow passing in userId for usage in publish fn
  userId = userId || Meteor.userId();
  return Holdings.find({'userId':userId}).map(function(holding){return holding.symbol;});
};

// Updates the price and change of all stocks in current user's holdings
refreshHeldStocks = function(currentUserId, symbol) {
  // If symbol is specified, only update that one stock, otherwise all holdings for the user
  var symbols = symbol ? [symbol] : getUserSymbols(currentUserId);

  // Ignore if there are no held stocks
  if (symbols.length < 1)
    return;

  // Otherwise, go ahead and pull stock details
  Meteor.call('refreshStocks', {'symbols': symbols, 'fields': ['s','l1','c1','p2','e1']}, function(error, results) {
    if (error) {
      var mutedErrors = Session.get('mutedErrors');
      if ( _.contains(mutedErrors, error.error) )
        return;

      Errors && Errors.throw(error.reason);

      // Mute "Market Data unavailable" error for future
      if (error.error === 504) {
        mutedErrors.push(error.error);
        Session.set('mutedErrors', mutedErrors);
      }
    }
  });
};

// Updates Holdings collection with latest stock data and market value, gains, etc.
// Takes the stock symbol to update and an optional userId (defaults to current user)
updateHoldingValue = function (holding, stock) {
  var fields = {};
  fields.lastTrade      = stock.lastTrade;
  fields.change         = stock.change;
  fields.changePercent  = stock.changePercent;
  fields.marketValue    = holding.shares * stock.lastTrade;
  fields.gain           = fields.marketValue - holding.costBasis;
  fields.gainPercent    = (holding.costBasis ? fields.gain / holding.costBasis : 0);
  fields.daysGain       = holding.shares * stock.change;
  // Overall Gain is the net gain of all trades plus the current market value, divided by the total cost of all bought shares
  // holding.overallGain = _.reduce(tradeArray, function(memo, trade) {return memo + trade.cashFlow;}, 0) + holding.marketValue;
  // holding.overallGainPercent = holding.overallGain / holding.totalCost;
  return fields;
};

updateHoldingsForStock = function(stock) {
  Holdings.find({'symbol': stock.symbol}).forEach(function(holding) {
    var holdingFields = updateHoldingValue(holding, stock);
    Holdings.update(holding._id, {$set: holdingFields});
  });
};

totalHoldings = function(userId) {
  var holdings = Holdings.find({ 'userId': (userId || Meteor.userId()) }).fetch();
  var total = {};
  total.marketValue        = _.reduce(holdings, function(memo, holding) {return memo + holding.marketValue;}, 0);
  total.costBasis          = _.reduce(holdings, function(memo, holding) {return memo + holding.costBasis;}, 0);
  total.daysGain           = _.reduce(holdings, function(memo, holding) {return memo + holding.daysGain;}, 0);
  total.gain               = _.reduce(holdings, function(memo, holding) {return memo + holding.gain;}, 0);
  total.gainPercent        = total.gain / total.costBasis;
  // total.overallGain        = _.reduce(holdings, function(memo, holding) {return memo + holding.overallGain;}, 0);
  var totalCost            = _.reduce(holdings, function(memo, holding) {return memo + holding.totalCost;}, 0);
  // total.overallGainPercent = total.overallGain / totalCost;

  return total;
};