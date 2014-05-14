Meteor.methods({

  // Clear all transactions & holdings for the current user
  'clearTransactions': function() {
    Transactions.remove({'userId': this.userId});
    Holdings.remove({'userId': this.userId});
  }
  
});