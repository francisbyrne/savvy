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

    var transaction = {
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

    transaction.cashFlow = transaction.type === 'Buy' ? -transaction.shares * transaction.price - transaction.commission : transaction.shares * transaction.price - transaction.commission;

    // Check if this stock exists and update current price etc.
    Meteor.call('refreshStocks', {symbols: [transaction.symbol]}, function(error, result) {
      if (error) 
        Errors.throw(error.reason);
      else {
        Transactions.insert(transaction);
        form.reset();
        template.find("input[name=symbol]").focus();
      }
    });
  }
});