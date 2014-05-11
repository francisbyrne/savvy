Template.transaction_menu.events({
  'click #clear': function(event, template) {
    if ( confirm('Are you sure you wish to Clear All Transactions?') ) {
      Meteor.call('clearTransactions', function(error, result) {
        if (error) {
          console.log(error);
        }
      });
    }
  },
  'click #import-csv': function(event, template) {
    Router.go('import_transactions');
  }
});