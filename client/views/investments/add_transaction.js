Template.add_transaction.events({
  'submit form#add-transaction': function(event, template) {
    event.preventDefault();

    var form = template.find('#add-transaction');
    var focusInput = template.find("input[name=symbol]");
    var fields = forms.parseForm(form);

    check(fields, Match.ObjectIncluding({
      symbol: String,
      type: String,
      date: String,
      shares: String,
      price: String,
      commission: Match.Optional(String)
    }) );

    // Get current user if not specified
    var userId = Meteor.userId();
    if( ! Match.test(userId, String) ) {
      if (Errors)
        Errors.throw('User ID invalid or non-existent. Please login to add holdings.');
      else
        return;
    }

    var transaction = {
      // Prevent ticker duplicates via capitals e.g. bhp, BHP
      symbol: fields.symbol.toUpperCase(),
      type: fields.type.toLowerCase(),
      date: moment(fields.date).format('ll'),
      shares: parseInt(fields.shares),
      price: parseInt(fields.price),
      commission: parseInt(fields.commission) || 0,
      userId: userId
    };

    Meteor.call('refreshStockDetails', {symbols: [transaction.symbol], fields: ['s', 'n', 'l1', 'c1', 'm', 'k', 'v', 'a2', 'j1', 'r', 'y', 'e', 'e1']}, function(error, result) {
      if (error) 
        Errors.throw(error.reason);
      // add transaction if not already done on client
      else {
        Transactions.insert(transaction);
        form.reset();
        focusInput.focus();
      }
    });
  }
});