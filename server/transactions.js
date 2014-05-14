Meteor.methods({

  // Clear all transactions & holdings for the current user
  'clearTransactions': function() {
    Transactions.remove({'userId': Meteor.userId()});
  }
  
});