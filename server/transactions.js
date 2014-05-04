Meteor.methods({

  // Clear all transactions for the current user
  'clearTransactions': function() {
    Transactions.remove({userId: this.userId});
  }
  
});