recalculateHolding = function recalculateHolding(holding, trade, isRemove) {
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

createHolding = function createHolding(userId, trade) {
  var holding = {
    'userId'        : userId,
    'symbol'        : trade.symbol,
    'shares'        : 0,
    'totalCost'     : 0,
    'totalShares'   : 0
  };
  
  return _.extend( holding, recalculateHolding(holding, trade) );
};

getUserSymbols = function getUserSymbols(userId) {
  // Allow passing in userId for usage in publish fn
  userId = userId || Meteor.userId();
  return Holdings.find({'userId':userId}).map(function(holding){return holding.symbol;});
};

// Updates the price and change of all stocks in current user's holdings
refreshHeldStocks = function refreshHeldStocks(currentUserId, symbol) {
  // If symbol is specified, only update that one stock, otherwise all holdings for the user
  var symbols = symbol ? [symbol] : getUserSymbols(currentUserId);

  // Ignore if there are no held stocks
  if (symbols.length < 1)
    return;

  // Otherwise, go ahead and pull stock details
  Meteor.call('refreshStocks', {'symbols': symbols, 'fields': ['s','l1','c1','p2','e1']}, function(error, results) {
    if (error && Meteor.isClient) {
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

// Calculates and returns holding value (but doesn't update holding)
calculateHoldingValue = function calculateHoldingValue(holding, stock) {
  var fields = {};
  fields.lastTrade       = stock.lastTrade;
  fields.change          = stock.change;
  fields.changePercent   = stock.changePercent;
  fields.marketValue     = holding.shares * stock.lastTrade;
  fields.gain            = fields.marketValue - holding.costBasis;
  fields.gainPercent     = (holding.costBasis ? fields.gain / holding.costBasis : 0);
  fields.daysGain        = holding.shares * stock.change;
  fields.daysGainPercent = fields.daysGain / fields.marketValue;

  // Need all trades for calculating overall gains
  var trades = Transactions.find({'symbol': holding.symbol}).fetch();

  // Overall Gain is the net gain of all trades plus the current market value, divided by the total cost of all bought shares
  fields.overallGain = _.reduce(trades, function(memo, trade) {return memo + trade.cashFlow;}, 0) + fields.marketValue;

  // Get the total cost by summing all Buy trades, in order to work out overall gain percentage
  var buys   = _.filter(trades, function(trade) {return trade.type === 'Buy';});
  var totalCost = _.reduce(buys, function(memo, trade) {return memo - trade.cashFlow;}, 0);
  fields.overallGainPercent = fields.overallGain / holding.totalCost;

  return fields;
};

// Updates Holdings collection with latest stock data and market value, gains, etc.
updateHoldingValue = function updateHoldingValue(holding) {
  var stock = Stocks.findOne({'symbol': holding.symbol});
  if (stock.lastTrade) {
    var fields = calculateHoldingValue(holding, stock);
    Holdings.update(holding._id, {$set: fields});
  } else {
    Meteor.call('refreshStocks', { symbols: [holding.symbol] }, function(error, results) {
      if (error) {
        throwError(error);
      } else {
        var stock = Stocks.findOne({'symbol': holding.symbol});
        var fields = calculateHoldingValue(holding, stock);
        Holdings.update(holding._id, {$set: fields});
      }
    });
  }
};

updateHoldingsForStock = function updateHoldingsForStock(stock) {
  Holdings.find({'symbol': stock.symbol}).forEach(function(holding) {
    updateHoldingValue(holding);
  });
};

totalHoldings = function totalHoldings(userId) {
  var holdings = Holdings.find({ 'userId': (userId || Meteor.userId()) }).fetch();
  var total = {};
  total.marketValue        = _.reduce(holdings, function(memo, holding) {return memo + holding.marketValue;}, 0);
  total.costBasis          = _.reduce(holdings, function(memo, holding) {return memo + holding.costBasis;}, 0);
  total.daysGain           = _.reduce(holdings, function(memo, holding) {return memo + holding.daysGain;}, 0);
  total.daysGainPercent    = total.daysGain / total.marketValue;
  total.gain               = total.marketValue - total.costBasis;
  total.gainPercent        = total.gain / total.costBasis;
  total.overallGain        = _.reduce(holdings, function(memo, holding) {return memo + holding.overallGain;}, 0);
  var totalCost            = _.reduce(holdings, function(memo, holding) {return memo + holding.totalCost;}, 0);
  total.overallGainPercent = total.overallGain / totalCost;

  return total;
};