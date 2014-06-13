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
  total.gain               = total.marketValue - total.costBasis; // _.reduce(holdings, function(memo, holding) {return memo + holding.gain;}, 0);
  total.gainPercent        = total.gain / total.costBasis;
  // total.overallGain        = _.reduce(holdings, function(memo, holding) {return memo + holding.overallGain;}, 0);
  var totalCost            = _.reduce(holdings, function(memo, holding) {return memo + holding.totalCost;}, 0);
  // total.overallGainPercent = total.overallGain / totalCost;

  return total;
};