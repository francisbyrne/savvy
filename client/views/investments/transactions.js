Meteor.startup(function() {
  Meteor.subscribe('userTransactions');
});

Template.transactions.helpers({
  transactions: function() {
    var transactions = Transactions.find({userId: Meteor.userId()}).fetch();

    // extend the stock document to include the cashValue of the transaction
    transactions = _.map(transactions, function(transaction) {
      return _.extend( transaction,  {
        cashValue: (transaction.type == 'buy' ? '-' : '') + transaction.shares * transaction.price
      });
    });
    return transactions;
  }
});