Meteor.startup(function() {
  Meteor.subscribe('userTransactions');
});

Template.transactions.helpers({
  transactions: function() {
    // Get all transactions for current user - sorted by ticker (asc) then date (asc)
    var transactions = Transactions.find( {userId: Meteor.userId()}, {sort: ['symbol', 'date']} ).fetch();

    // Extend the transaction document to include the cashValue of the transaction, and convert currency/date fields
    transactions = _.map(transactions, function(transaction) {
      return _.extend( transaction,  {
        cashFlow: numeral(transaction.cashFlow).format(),
        price: numeral(transaction.price).format(),
        commission: numeral(transaction.commission).format(),
        date: moment(transaction.date).format('ll')
      });
    });
    return transactions;
  }
});

Template.transactions.events({
  'click button.remove-transaction': function(event, template) {
    if ( confirm('Are you sure you wish to remove ' + this.type + ' ' + this.symbol + ' on ' + this.date + '?' ) )
      Transactions.remove(this._id);
  }
})