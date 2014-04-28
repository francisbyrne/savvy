Template.add_transaction.rendered = function(){
    // initialize typeahead for search
    Meteor.typeahead(this.$('.ticker'));
};

Template.add_transaction.search = function(){
  // map symbols to array for typeahead datasource
  return Stocks.find().fetch().map(function(it){ return it.symbol; });
};

Template.add_transaction.events({
  'submit form#add-transaction': function(event, template) {
    event.preventDefault();

    var form = template.find('#add-transaction');
    var fields = forms.parseForm(form);

    check(fields, Match.ObjectIncluding({
      symbol: String,
      type: String,
      date: String,
      shares: String,
      price: String,
      commission: Match.Optional(String)
    }) );

    var userId = Meteor.userId();
    if( ! Match.test(userId, String) ) {
      if (Errors)
        Errors.throw('User ID invalid or non-existent. Please login to add holdings.');
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
        Errors.throw(error.reason);
      else {
        Transactions.insert(trade);
        form.reset();
        template.find("input[name=symbol]").focus();
      }
    });
  }
});