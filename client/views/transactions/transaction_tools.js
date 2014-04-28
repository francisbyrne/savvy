Template.transaction_tools.events({
  'click #clear': function(event, template) {
    if ( confirm('Are you sure you wish to Clear All Transactions?') ) {
      Meteor.call('clearTransactions', function(error, result) {
        if (error) {
          console.log(error);
        }
      });
    }
  }
})