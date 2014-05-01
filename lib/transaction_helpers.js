addTransaction = function(fields, cb) {
  check(fields, Match.ObjectIncluding({
    symbol: String,
    type: String,
    date: String,
    shares: String,
    price: String,
    commission: Match.Optional(String)
  }) );

  if ( fields.symbol.length < 1 ) {
    Errors && Errors.throw('Trade not added. No symbol entered.');
    return;
  }

  var userId = Meteor.userId();
  if( ! Match.test(userId, String) ) {
    if (Errors)
      Errors.throw('Trade not added. User ID invalid or non-existent. Please login to add holdings.');
    else
      return;
  }

  var trade = {
    userId: userId,

    // Prevent ticker duplicates via capitals e.g. bhp, BHP
    symbol: fields.symbol.toUpperCase(),
    type: strings.capitalise(fields.type.toLowerCase()),

    // Convert date to readable format
    date: new Date(fields.date),

    // Remove any currency formatting for numeric inputs and convert to numbers
    shares: numeral().unformat(fields.shares),
    price: numeral().unformat(fields.price),
    commission: numeral().unformat(fields.commission) || 0
  };

  // Cash Flow is -ve for Buys and +ve for Sells
  trade.cashFlow = (trade.type === 'Buy' ? -trade.shares : trade.shares) * trade.price - trade.commission;

  // Check if this stock exists and update current price etc.
  Meteor.call('refreshStocks', {symbols: [trade.symbol]}, function(error, result) {
    if (error) 
      Errors && Errors.throw(error.reason);
    else {
      Transactions.insert(trade);
      cb && cb();
    }
  });
};